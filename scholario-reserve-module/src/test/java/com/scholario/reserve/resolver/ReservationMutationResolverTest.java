package com.scholario.reserve.resolver;

import com.scholario.reserve.dto.ReservationResponse;
import com.scholario.reserve.model.Reservation;
import com.scholario.reserve.model.Pending;
import com.scholario.reserve.service.ReservationService;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationMutationResolverTest {

    @Mock
    private ReservationService reservationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReservationMutationResolver reservationMutationResolver;

    private Reservation reservation;

    @BeforeEach
    void setUp() {
        reservation = new Reservation();
        reservation.setId(1L);
        reservation.setBookId(10L);
        reservation.setUserId(20L);
        reservation.setStatus(new Pending());
    }

    @Test
    void testReserveBook() {
        Long bookId = 10L;
        Long userId = 20L;
        when(userService.getCurrentUserId()).thenReturn(userId);
        when(reservationService.reserveBook(bookId, userId)).thenReturn(reservation);

        ReservationResponse response = reservationMutationResolver.reserveBook(bookId);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(10L, response.bookId());
        assertEquals(20L, response.userId());
        verify(reservationService, times(1)).reserveBook(bookId, userId);
    }

    @Test
    void testCancelReservation() {
        Long reservationId = 1L;
        when(reservationService.cancelReservation(reservationId)).thenReturn(reservation);

        ReservationResponse response = reservationMutationResolver.cancelReservation(reservationId);

        assertNotNull(response);
        assertEquals(1L, response.id());
        verify(reservationService, times(1)).cancelReservation(reservationId);
    }

    @Test
    void testAllocateReservedBook() {
        Long bookId = 10L;
        when(reservationService.allocateReservedBook(bookId)).thenReturn(reservation);

        ReservationResponse response = reservationMutationResolver.allocateReservedBook(bookId);

        assertNotNull(response);
        assertEquals(1L, response.id());
        verify(reservationService, times(1)).allocateReservedBook(bookId);
    }

    @Test
    void testAllocateReservedBook_WhenNoReservation() {
        Long bookId = 10L;
        when(reservationService.allocateReservedBook(bookId)).thenReturn(null);

        ReservationResponse response = reservationMutationResolver.allocateReservedBook(bookId);

        assertNull(response);
        verify(reservationService, times(1)).allocateReservedBook(bookId);
    }
}
