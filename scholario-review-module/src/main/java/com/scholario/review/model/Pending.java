package com.scholario.review.model;

public record Pending() implements ReviewStatus {
    @Override
    public String name() {
        return "PENDING";
    }
}
