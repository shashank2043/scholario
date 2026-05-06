package com.scholario.review.model;

public record Rejected() implements ReviewStatus {
    @Override
    public String name() {
        return "REJECTED";
    }
}
