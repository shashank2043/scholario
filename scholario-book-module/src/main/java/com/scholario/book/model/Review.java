package com.scholario.book.model;

public record Review() implements BookState {
    @Override
    public String name() {
        return "REVIEW";
    }

    @Override
    public String toString() {
        return "REVIEW";
    }
}