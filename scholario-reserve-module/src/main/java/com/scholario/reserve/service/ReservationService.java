package com.scholario.reserve.service;

import com.scholario.reserve.model.*;
import com.scholario.reserve.repository.ReservationRepository;
import com.scholario.book.repository.BookRepository;
import com.scholario.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              BookRepository bookRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation reserveBook(Long bookId, Long userId) {
        validateBookExists(bookId);
        validateUserExists(userId);

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
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found with id: " + reservationId));
        
        if (!(reservation.getStatus() instanceof Pending)) {
            throw new IllegalStateException("Only pending reservations can be cancelled");
        }

        reservation.setStatus(new Cancelled());
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation allocateReservedBook(Long bookId) {
        validateBookExists(bookId);

        // FIFO: Get all reservations for the book ordered by date
        List<Reservation> allReservations = reservationRepository.findByBookIdOrderByReservedAtAsc(bookId);

        LocalDateTime now = LocalDateTime.now();
        for (Reservation reservation : allReservations) {
            if (!(reservation.getStatus() instanceof Pending)) {
                continue;
            }

            if (reservation.getExpiresAt() != null && reservation.getExpiresAt().isBefore(now)) {
                reservation.setStatus(new Expired());
                reservationRepository.save(reservation);
                continue;
            }

            reservation.setStatus(new Allocated());
            return reservationRepository.save(reservation);
        }

        return null;
    }

    public List<Reservation> getReservationQueue(Long bookId) {
        return reservationRepository.findByBookIdOrderByReservedAtAsc(bookId).stream()
                .filter(r -> r.getStatus() instanceof Pending)
                .toList();
    }

    public List<Reservation> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    private void validateBookExists(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new IllegalArgumentException("Book not found with id: " + bookId);
        }
    }

    private void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
    }
}
