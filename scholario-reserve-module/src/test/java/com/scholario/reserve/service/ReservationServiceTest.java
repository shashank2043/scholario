package com.scholario.reserve.service;

import com.scholario.book.repository.BookRepository;
import com.scholario.reserve.model.*;
import com.scholario.reserve.repository.ReservationRepository;
import com.scholario.user.repository.UserRepository;
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
    @Mock
    private BookRepository bookRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        lenient().when(bookRepository.existsById(anyLong())).thenReturn(true);
        lenient().when(userRepository.existsById(anyLong())).thenReturn(true);
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
    void testReserveBook_BookNotFound() {
        when(bookRepository.existsById(1L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> reservationService.reserveBook(1L, 2L));
        verify(reservationRepository, never()).save(any(Reservation.class));
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

        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId))
                .thenReturn(Arrays.asList(expired, valid));
        
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Reservation allocated = reservationService.allocateReservedBook(bookId);

        assertNotNull(allocated);
        assertEquals(2L, allocated.getId());
        assertTrue(allocated.getStatus() instanceof Allocated);
        
        verify(reservationRepository).save(argThat(r -> r.getId().equals(1L) && r.getStatus() instanceof Expired));
    }

    @Test
    void testCancelReservation_NotFound() {
        Long reservationId = 999L;
        when(reservationRepository.findById(reservationId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> reservationService.cancelReservation(reservationId));
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void testCancelReservation_NotPending() {
        Long reservationId = 1L;
        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setStatus(new Allocated());

        when(reservationRepository.findById(reservationId)).thenReturn(Optional.of(reservation));

        assertThrows(RuntimeException.class, () -> reservationService.cancelReservation(reservationId));
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void testAllocateReservedBook_NoReservations() {
        Long bookId = 1L;
        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId)).thenReturn(Collections.emptyList());

        Reservation result = reservationService.allocateReservedBook(bookId);

        assertNull(result);
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void testAllocateReservedBook_NoPendingReservations() {
        Long bookId = 1L;
        Reservation allocated = new Reservation();
        allocated.setId(1L);
        allocated.setStatus(new Allocated());

        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId)).thenReturn(Collections.singletonList(allocated));

        Reservation result = reservationService.allocateReservedBook(bookId);

        assertNull(result);
    }

    @Test
    void testGetReservationQueue() {
        Long bookId = 1L;
        Reservation pending1 = new Reservation();
        pending1.setId(1L);
        pending1.setStatus(new Pending());
        pending1.setReservedAt(LocalDateTime.now().minusHours(2));

        Reservation allocated = new Reservation();
        allocated.setId(2L);
        allocated.setStatus(new Allocated());

        Reservation pending2 = new Reservation();
        pending2.setId(3L);
        pending2.setStatus(new Pending());
        pending2.setReservedAt(LocalDateTime.now().minusHours(1));

        when(reservationRepository.findByBookIdOrderByReservedAtAsc(bookId)).thenReturn(Arrays.asList(pending1, allocated, pending2));

        List<Reservation> queue = reservationService.getReservationQueue(bookId);

        assertEquals(2, queue.size());
        assertTrue(queue.get(0).getStatus() instanceof Pending);
        assertTrue(queue.get(1).getStatus() instanceof Pending);
        assertEquals(1L, queue.get(0).getId());
        assertEquals(3L, queue.get(1).getId());
    }

    @Test
    void testGetUserReservations() {
        Long userId = 2L;
        Reservation r1 = new Reservation();
        r1.setId(1L);
        r1.setUserId(userId);

        Reservation r2 = new Reservation();
        r2.setId(2L);
        r2.setUserId(userId);

        when(reservationRepository.findByUserId(userId)).thenReturn(Arrays.asList(r1, r2));

        List<Reservation> result = reservationService.getUserReservations(userId);

        assertEquals(2, result.size());
        verify(reservationRepository, times(1)).findByUserId(userId);
    }
}
