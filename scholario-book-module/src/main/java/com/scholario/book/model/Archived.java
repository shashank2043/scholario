package com.scholario.book.model;

public record Archived() implements BookState {
    @Override
    public String name() {
        return "ARCHIVED";
    }

    @Override
    public String toString() {
        return "ARCHIVED";
    }
}