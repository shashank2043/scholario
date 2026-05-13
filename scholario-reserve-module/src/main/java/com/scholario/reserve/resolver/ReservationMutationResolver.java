package com.scholario.reserve.resolver;

import com.scholario.reserve.dto.ReservationResponse;
import com.scholario.reserve.model.Reservation;
import com.scholario.reserve.service.ReservationService;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ReservationMutationResolver {

    private final ReservationService reservationService;
    private final UserService userService;

    @MutationMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LIBRARIAN', 'ADMIN')")
    public ReservationResponse reserveBook(@Argument Long bookId) {
        Reservation reservation = reservationService.reserveBook(bookId, userService.getCurrentUserId());
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
