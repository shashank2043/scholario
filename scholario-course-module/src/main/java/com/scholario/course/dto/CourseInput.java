package com.scholario.course.dto;

public record CourseInput(
        String courseCode,
        String title,
        String description,
        Long facultyId
) {
}
