package com.scholario.course.resolver;

import com.scholario.course.dto.CourseInput;
import com.scholario.course.model.Course;
import com.scholario.course.service.CourseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseMutationResolverTest {

    @Mock
    private CourseService courseService;

    @InjectMocks
    private CourseMutationResolver courseMutationResolver;

    @Test
    void createCourse_Success() {
        CourseInput input = new CourseInput("CODE", "Title", "Desc", 1L);
        Course course = new Course();
        when(courseService.createCourse(input)).thenReturn(course);

        Course result = courseMutationResolver.createCourse(input);

        assertEquals(course, result);
        verify(courseService).createCourse(input);
    }
}
