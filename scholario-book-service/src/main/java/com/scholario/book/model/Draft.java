package com.scholario.book.model;

public record Draft() implements BookState {
    @Override
    public String name() {
        return "DRAFT";
    }

    @Override
    public String toString() {
        return "DRAFT";
    }
}