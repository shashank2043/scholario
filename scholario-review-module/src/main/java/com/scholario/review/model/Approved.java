package com.scholario.review.model;

public record Approved() implements ReviewStatus {
    @Override
    public String name() {
        return "APPROVED";
    }
}
