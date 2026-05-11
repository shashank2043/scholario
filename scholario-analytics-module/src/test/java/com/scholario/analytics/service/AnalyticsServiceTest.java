package com.scholario.analytics.service;

import com.scholario.analytics.dto.BookUsageAnalytics;
import com.scholario.analytics.dto.CourseMaterialStats;
import com.scholario.analytics.dto.FacultyPerformance;
import com.scholario.analytics.dto.StudentEngagement;
import com.scholario.book.model.Book;
import com.scholario.book.repository.BookRepository;
import com.scholario.content.model.DigitalContent;
import com.scholario.content.repository.ContentAccessLogRepository;
import com.scholario.content.repository.DigitalContentRepository;
import com.scholario.course.model.Course;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.reserve.repository.ReservationRepository;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private IssueRecordRepository issueRecordRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private DigitalContentRepository digitalContentRepository;
    @Mock
    private ContentAccessLogRepository contentAccessLogRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseMaterialRepository courseMaterialRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void getBookUsageAnalytics_ShouldReturnCorrectStats() {
        Book book = new Book();
        book.setId(1L);
        book.setTitle("Test Book");
        
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(issueRecordRepository.countByBookId(1L)).thenReturn(5L);
        when(reservationRepository.countByBookId(1L)).thenReturn(3L);
        
        DigitalContent content = new DigitalContent();
        content.setId(10L);
        when(digitalContentRepository.findByBookId(1L)).thenReturn(List.of(content));
        when(contentAccessLogRepository.countByContentIdIn(List.of(10L))).thenReturn(10L);

        BookUsageAnalytics stats = analyticsService.getBookUsageAnalytics(1L);

        assertEquals(1L, stats.bookId());
        assertEquals("Test Book", stats.title());
        assertEquals(5L, stats.totalIssues());
        assertEquals(3L, stats.totalReservations());
        assertEquals(10L, stats.digitalAccessCount());
    }

    @Test
    void getBookUsageAnalytics_ShouldThrowException_WhenBookNotFound() {
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> analyticsService.getBookUsageAnalytics(1L));
    }

    @Test
    void getCourseMaterialStats_ShouldReturnCorrectStats() {
        Course course = new Course();
        course.setId(1L);
        course.setCourseCode("CS101");

        com.scholario.course.model.CourseMaterial m1 = new com.scholario.course.model.CourseMaterial();
        m1.setBookId(10L);
        m1.setMandatory(true);

        com.scholario.course.model.CourseMaterial m2 = new com.scholario.course.model.CourseMaterial();
        m2.setBookId(11L);
        m2.setMandatory(false);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseMaterialRepository.findByCourseId(1L)).thenReturn(List.of(m1, m2));
        
        // Material 1 has usage (issue)
        when(issueRecordRepository.countByBookId(10L)).thenReturn(1L);
        
        // Material 2 has no usage initially
        when(issueRecordRepository.countByBookId(11L)).thenReturn(0L);
        when(reservationRepository.countByBookId(11L)).thenReturn(0L);
        when(digitalContentRepository.findByBookId(11L)).thenReturn(Collections.emptyList());

        CourseMaterialStats stats = analyticsService.getCourseMaterialStats(1L);

        assertEquals(1L, stats.courseId());
        assertEquals("CS101", stats.courseCode());
        assertEquals(2L, stats.totalMaterials());
        assertEquals(1L, stats.mandatoryCount());
        assertEquals(1L, stats.optionalCount());
        assertEquals(0.5, stats.averageUsageRate());
    }

    @Test
    void getFacultyPerformance_ShouldReturnCorrectStats() {
        User faculty = new User();
        faculty.setId(1L);
        faculty.setFullName("Dr. Smith");

        when(userRepository.findById(1L)).thenReturn(Optional.of(faculty));
        when(bookRepository.countByFacultyId(1L)).thenReturn(3L);
        when(courseRepository.countByFacultyId(1L)).thenReturn(2L);
        
        Book book = new Book();
        book.setId(10L);
        when(bookRepository.findByFacultyId(1L)).thenReturn(List.of(book));
        when(issueRecordRepository.countByBookId(10L)).thenReturn(20L);

        FacultyPerformance stats = analyticsService.getFacultyPerformance(1L);

        assertEquals(1L, stats.facultyId());
        assertEquals("Dr. Smith", stats.facultyName());
        assertEquals(3L, stats.booksAuthored());
        assertEquals(2L, stats.coursesTaught());
        assertEquals(20L, stats.totalStudentEngagement());
    }

    @Test
    void getStudentEngagement_ShouldReturnCorrectStats() {
        User student = new User();
        student.setId(1L);
        student.setFullName("John Doe");

        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(issueRecordRepository.countByUserId(1L)).thenReturn(4L);
        when(contentAccessLogRepository.countByUserId(1L)).thenReturn(15L);
        when(reservationRepository.countByUserId(1L)).thenReturn(2L);

        StudentEngagement stats = analyticsService.getStudentEngagement(1L);

        assertEquals(1L, stats.studentId());
        assertEquals("John Doe", stats.studentName());
        assertEquals(4L, stats.booksBorrowed());
        assertEquals(15L, stats.digitalContentAccessed());
        assertEquals(2L, stats.activeReservations());
    }
}
