package com.scholario.reserve.model;

public record Allocated() implements ReservationStatus {
    @Override
    public String name() {
        return "ALLOCATED";
    }
}
