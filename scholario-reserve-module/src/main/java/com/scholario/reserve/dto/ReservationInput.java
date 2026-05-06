package com.scholario.reserve.dto;

public record ReservationInput(
    Long bookId,
    Long userId
) {}
