package com.scholario.course.dto;

public record CourseMaterialInput(
        Long courseId,
        Long bookId,
        Boolean mandatory
) {
}
