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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationQueryResolverTest {

    @Mock
    private ReservationService reservationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ReservationQueryResolver reservationQueryResolver;

    private Reservation reservation1;
    private Reservation reservation2;

    @BeforeEach
    void setUp() {
        reservation1 = new Reservation();
        reservation1.setId(1L);
        reservation1.setBookId(10L);
        reservation1.setUserId(20L);
        reservation1.setReservedAt(LocalDateTime.now().minusDays(1));
        reservation1.setStatus(new Pending());

        reservation2 = new Reservation();
        reservation2.setId(2L);
        reservation2.setBookId(10L);
        reservation2.setUserId(21L);
        reservation2.setReservedAt(LocalDateTime.now());
        reservation2.setStatus(new Pending());
    }

    @Test
    void testGetReservationQueue() {
        Long bookId = 10L;
        when(reservationService.getReservationQueue(bookId)).thenReturn(Arrays.asList(reservation1, reservation2));

        List<ReservationResponse> responses = reservationQueryResolver.getReservationQueue(bookId);

        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals(1L, responses.get(0).id());
        assertEquals(2L, responses.get(1).id());
        verify(reservationService, times(1)).getReservationQueue(bookId);
    }

    @Test
    void testGetUserReservations() {
        Long userId = 20L;
        when(userService.getCurrentUserId()).thenReturn(userId);
        when(reservationService.getUserReservations(userId)).thenReturn(Arrays.asList(reservation1));

        List<ReservationResponse> responses = reservationQueryResolver.getUserReservations();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(1L, responses.get(0).id());
        verify(reservationService, times(1)).getUserReservations(userId);
    }
}