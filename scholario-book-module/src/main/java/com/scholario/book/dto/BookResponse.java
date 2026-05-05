package com.scholario.book.dto;

import com.scholario.book.model.BookState;

public record BookResponse(
        Long id,
        String title,
        String isbn,
        Long facultyId,
        String description,
        Integer versionNumber,
        String state,
        Long parentBookId,
        String createdAt,
        String updatedAt
) {
    public static BookResponse fromEntity(org.springframework.data.projection.ProjectionFactory factory,
                                          com.scholario.book.model.Book book) {
        return new BookResponse(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                book.getFacultyId(),
                book.getDescription(),
                book.getVersionNumber(),
                book.getState() != null ? book.getState().name() : "DRAFT",
                book.getParentBookId(),
                book.getCreatedAt() != null ? book.getCreatedAt().toString() : null,
                book.getUpdatedAt() != null ? book.getUpdatedAt().toString() : null
        );
    }
}
