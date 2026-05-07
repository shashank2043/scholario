package com.scholario.course.resolver;

import com.scholario.course.model.Course;
import com.scholario.course.service.CourseService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseQueryResolverTest {

    @Mock
    private CourseService courseService;

    @InjectMocks
    private CourseQueryResolver courseQueryResolver;

    @Test
    void getCourseById_Success() {
        Course course = new Course();
        course.setId(1L);
        when(courseService.getCourseById(1L)).thenReturn(Optional.of(course));

        Optional<Course> result = courseQueryResolver.getCourseById(1L);

        assertEquals(Optional.of(course), result);
        verify(courseService).getCourseById(1L);
    }
}
