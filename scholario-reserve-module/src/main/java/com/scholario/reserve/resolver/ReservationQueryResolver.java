package com.scholario.reserve.resolver;

import com.scholario.reserve.dto.ReservationResponse;
import com.scholario.reserve.service.ReservationService;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ReservationQueryResolver {

    private final ReservationService reservationService;
    private final UserService userService;

    @QueryMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<ReservationResponse> getReservationQueue(@Argument Long bookId) {
        return reservationService.getReservationQueue(bookId).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }

    @QueryMapping
    @PreAuthorize("isAuthenticated()")
    public List<ReservationResponse> getUserReservations() {
        return reservationService.getUserReservations(userService.getCurrentUserId()).stream()
                .map(ReservationResponse::fromEntity)
                .toList();
    }
}
