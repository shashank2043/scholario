package com.scholario.course.service;

import com.scholario.book.model.Book;
import com.scholario.book.model.Published;
import com.scholario.book.repository.BookRepository;
import com.scholario.course.dto.CourseInput;
import com.scholario.course.dto.CourseMaterialInput;
import com.scholario.course.model.Course;
import com.scholario.course.model.CourseMaterial;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseMaterialRepository courseMaterialRepository;

    @Mock
    private BookRepository bookRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourseService courseService;

    private Course course;
    private Book book;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setId(1L);
        course.setCourseCode("CS101");
        course.setTitle("Intro to CS");

        book = new Book();
        book.setId(1L);
        book.setState(new Published());

        User faculty = new User();
        faculty.setId(1L);
        faculty.setRole(Role.FACULTY);
        lenient().when(userRepository.findById(1L)).thenReturn(Optional.of(faculty));
    }

    @Test
    void createCourse_Success() {
        CourseInput input = new CourseInput("CS101", "Intro to CS", "Desc", 1L);
        when(courseRepository.findByCourseCode("CS101")).thenReturn(Optional.empty());
        when(courseRepository.save(any(Course.class))).thenReturn(course);

        Course createdCourse = courseService.createCourse(input);

        assertNotNull(createdCourse);
        assertEquals("CS101", createdCourse.getCourseCode());
    }

    @Test
    void assignBookToCourse_Success() {
        CourseMaterialInput input = new CourseMaterialInput(1L, 1L, true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(courseMaterialRepository.findByCourseIdAndBookId(1L, 1L)).thenReturn(Optional.empty());
        when(courseMaterialRepository.save(any(CourseMaterial.class))).thenAnswer(i -> i.getArguments()[0]);

        CourseMaterial material = courseService.assignBookToCourse(input);

        assertNotNull(material);
        assertEquals(course, material.getCourse());
        assertTrue(material.isMandatory());
    }

    @Test
    void assignBookToCourse_Failure_NotPublished() {
        book.setState(new com.scholario.book.model.Draft());
        CourseMaterialInput input = new CourseMaterialInput(1L, 1L, true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThrows(IllegalStateException.class, () -> courseService.assignBookToCourse(input));
    }
}
