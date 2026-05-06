package com.scholario.reserve.resolver;

import com.scholario.reserve.dto.ReservationResponse;
import com.scholario.reserve.service.ReservationService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ReservationQueryResolver {

    private final ReservationService reservationService;

    public ReservationQueryResolver(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @QueryMapping
    public List<ReservationResponse> getReservationQueue(@Argument Long bookId) {
        return reservationService.getReservationQueue(bookId).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @QueryMapping
    public List<ReservationResponse> getUserReservations(@Argument Long userId) {
        return reservationService.getUserReservations(userId).stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
