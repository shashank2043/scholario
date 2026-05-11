package com.scholario.book.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookInput(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "ISBN is required")
        String isbn,

        @NotNull(message = "Faculty ID is required")
        Long facultyId,

        String description
) {
}
