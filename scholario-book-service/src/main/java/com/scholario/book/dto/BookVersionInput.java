package com.scholario.book.dto;

public record BookVersionInput(
        Long parentBookId,
        String title,
        String isbn,
        String description
) {
}
