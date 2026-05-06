package com.scholario.review.model;

public record ChangesRequested() implements ReviewStatus {
    @Override
    public String name() {
        return "CHANGES_REQUESTED";
    }
}
