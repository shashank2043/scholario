package com.scholario.course.resolver;

import com.scholario.book.model.Book;
import com.scholario.course.dto.CourseMaterialResponse;
import com.scholario.course.dto.CourseResponse;
import com.scholario.course.model.Course;
import com.scholario.course.model.CourseMaterial;
import com.scholario.course.service.CourseService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class CourseQueryResolver {

    private final CourseService courseService;

    public CourseQueryResolver(CourseService courseService) {
        this.courseService = courseService;
    }

    @QueryMapping
    public Optional<Course> getCourseById(@Argument Long id) {
        return courseService.getCourseById(id);
    }

    @QueryMapping
    public List<Course> getCoursesByFaculty(@Argument Long facultyId) {
        return courseService.getCoursesByFaculty(facultyId);
    }

    @QueryMapping
    public List<CourseMaterialResponse> getCourseMaterials(@Argument Long courseId) {
        return courseService.getCourseMaterials(courseId).stream()
                .map(CourseMaterialResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @QueryMapping
    public List<Book> getBooksByCourse(@Argument Long courseId) {
        return courseService.getBooksByCourse(courseId);
    }
}