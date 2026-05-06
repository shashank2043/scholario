package com.scholario.reserve.service;

import com.scholario.reserve.model.*;
import com.scholario.reserve.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testReserveBook() {
        Long bookId = 1L;
        Long userId = 2L;

        Reservation reservation = new Reservation();
        reservation.setId(1L);
        reservation.setBookId(bookId);
        reservation.setUserId(userId);
        reservation.setStatus(new Pending());

        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        Reservation result = reservationService.reserveBook(bookId, userId);

        assertNotNull(result);
        assertEquals(bookId, result.getBookId());
        assertEquals(userId, result.getUserId());
        assertTrue(result.getStatus() instanceof Pending);
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    void testCancelReservation() {
        Long reservationId = 1L;
        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setStatus(new Pending());

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        Reservation result = reservationService.cancelReservation(reservationId);

        assertNotNull(result);
        assertTrue(result.getStatus() instanceof Cancelled);
        verify(reservationRepository, times(1)).save(reservation);
    }

    @Test
    void testAllocateReservedBookFIFO() {
        Long bookId = 1L;
        
        Reservation first = new Reservation();
        first.setId(1L);
        first.setReservedAt(LocalDateTime.now().minusDays(1));
        first.setStatus(new Pending());

        Reservation second = new Reservation();
        second.setId(2L);
        second.setReservedAt(LocalDateTime.now());
        second.setStatus(new Pending());

        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId))
                .thenReturn(Arrays.asList(first, second));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation allocated = reservationService.allocateReservedBook(bookId);

        assertNotNull(allocated);
        assertEquals(1L, allocated.getId());
        assertTrue(allocated.getStatus() instanceof Allocated);
    }

    @Test
    void testAllocateReservedBookWithExpiry() {
        Long bookId = 1L;
        
        Reservation expired = new Reservation();
        expired.setId(1L);
        expired.setExpiresAt(LocalDateTime.now().minusHours(1));
        expired.setStatus(new Pending());

        Reservation valid = new Reservation();
        valid.setId(2L);
        valid.setExpiresAt(LocalDateTime.now().plusDays(1));
        valid.setStatus(new Pending());

        // First call returns [expired, valid]
        // Second call (recursive) returns [valid]
        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId))
                .thenReturn(Arrays.asList(expired, valid))
                .thenReturn(Collections.singletonList(valid));
        
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation allocated = reservationService.allocateReservedBook(bookId);

        assertNotNull(allocated);
        assertEquals(2L, allocated.getId());
        assertTrue(allocated.getStatus() instanceof Allocated);
        
        verify(reservationRepository).save(argThat(r -> r.getId().equals(1L) && r.getStatus() instanceof Expired));
    }
}
