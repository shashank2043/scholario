package com.scholario.book.dto;

public record BookInput(
        String title,
        String isbn,
        Long facultyId,
        String description
) {
}
