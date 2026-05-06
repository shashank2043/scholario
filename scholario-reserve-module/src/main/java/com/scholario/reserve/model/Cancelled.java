package com.scholario.reserve.model;

public record Cancelled() implements ReservationStatus {
    @Override
    public String name() {
        return "CANCELLED";
    }
}
