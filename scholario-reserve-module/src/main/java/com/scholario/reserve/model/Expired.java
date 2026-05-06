package com.scholario.reserve.model;

public record Expired() implements ReservationStatus {
    @Override
    public String name() {
        return "EXPIRED";
    }
}
