package com.scholario.reserve.service;

import com.scholario.reserve.model.*;
import com.scholario.reserve.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Transactional
    public Reservation reserveBook(Long bookId, Long userId) {
        // In a real system, we'd check if the book exists and if it's already available
        // But for this module, we just create a reservation.
        Reservation reservation = new Reservation();
        reservation.setBookId(bookId);
        reservation.setUserId(userId);
        reservation.setReservedAt(LocalDateTime.now());
        // Default expiry of 2 days
        reservation.setExpiresAt(LocalDateTime.now().plusDays(2));
        reservation.setStatus(new Pending());
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (!(reservation.getStatus() instanceof Pending)) {
            throw new RuntimeException("Only pending reservations can be cancelled");
        }

        reservation.setStatus(new Cancelled());
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation allocateReservedBook(Long bookId) {
        // FIFO: Get all reservations for the book ordered by date
        List<Reservation> allReservations = reservationRepository.findByBookIdOrderByReservedAtAsc(bookId);
        
        // Filter for Pending status
        List<Reservation> queue = allReservations.stream()
                .filter(r -> r.getStatus() instanceof Pending)
                .toList();
        
        if (queue.isEmpty()) {
            return null;
        }

        Reservation first = queue.get(0);
        
        // Check for expiry (Simple auto-expiry check)
        if (first.getExpiresAt() != null && first.getExpiresAt().isBefore(LocalDateTime.now())) {
            first.setStatus(new Expired());
            reservationRepository.save(first);
            // Recursively try to allocate the next one
            return allocateReservedBook(bookId);
        }

        first.setStatus(new Allocated());
        return reservationRepository.save(first);
    }

    public List<Reservation> getReservationQueue(Long bookId) {
        return reservationRepository.findByBookIdOrderByReservedAtAsc(bookId).stream()
                .filter(r -> r.getStatus() instanceof Pending)
                .toList();
    }

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId);
    }
}
