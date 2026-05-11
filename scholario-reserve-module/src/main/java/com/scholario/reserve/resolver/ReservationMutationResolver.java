package com.scholario.reserve.resolver;

import com.scholario.reserve.dto.ReservationInput;
import com.scholario.reserve.dto.ReservationResponse;
import com.scholario.reserve.model.Reservation;
import com.scholario.reserve.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
public class ReservationMutationResolver {

    private final ReservationService reservationService;

    public ReservationMutationResolver(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LIBRARIAN', 'ADMIN')")
    public ReservationResponse reserveBook(@Valid @Argument ReservationInput input) {
        Reservation reservation = reservationService.reserveBook(input.bookId(), input.userId());
        return ReservationResponse.fromEntity(reservation);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LIBRARIAN', 'ADMIN')")
    public ReservationResponse cancelReservation(@Argument Long reservationId) {
        Reservation reservation = reservationService.cancelReservation(reservationId);
        return ReservationResponse.fromEntity(reservation);
    }

    @MutationMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ReservationResponse allocateReservedBook(@Argument Long bookId) {
        Reservation reservation = reservationService.allocateReservedBook(bookId);
        if (reservation == null) {
            return null;
        }
        return ReservationResponse.fromEntity(reservation);
    }
}
