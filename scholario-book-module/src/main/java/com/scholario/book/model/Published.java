package com.scholario.book.model;

public record Published() implements BookState {
    @Override
    public String name() {
        return "PUBLISHED";
    }

    @Override
    public String toString() {
        return "PUBLISHED";
    }
}