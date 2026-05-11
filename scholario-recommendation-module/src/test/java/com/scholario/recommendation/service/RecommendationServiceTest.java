package com.scholario.recommendation.service;

import com.scholario.analytics.service.AnalyticsService;
import com.scholario.book.model.Book;
import com.scholario.book.repository.BookRepository;
import com.scholario.course.model.Course;
import com.scholario.course.repository.CourseMaterialRepository;
import com.scholario.course.repository.CourseRepository;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.recommendation.dto.BookRecommendation;
import com.scholario.recommendation.dto.CourseMaterialSuggestion;
import com.scholario.recommendation.dto.DemandPrediction;
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
class RecommendationServiceTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private IssueRecordRepository issueRecordRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseMaterialRepository courseMaterialRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private RecommendationService recommendationService;

    @Test
    void recommendBooks_ShouldReturnRecommendations() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(issueRecordRepository.findByUserId(1L)).thenReturn(Collections.emptyList());
        
        Book book = new Book();
        book.setId(10L);
        book.setTitle("Deep Learning");
        when(bookRepository.findAll()).thenReturn(List.of(book));

        List<BookRecommendation> results = recommendationService.recommendBooks(1L);

        assertFalse(results.isEmpty());
        assertEquals(10L, results.get(0).bookId());
        assertEquals("Deep Learning", results.get(0).title());
    }

    @Test
    void recommendBooks_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.existsById(1L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> recommendationService.recommendBooks(1L));
    }

    @Test
    void suggestCourseMaterials_ShouldReturnSuggestions() {
        Course course = new Course();
        course.setId(1L);
        course.setFacultyId(5L);
        course.setTitle("AI 101");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(courseMaterialRepository.findBookIdsByCourseId(1L)).thenReturn(Collections.emptyList());
        
        Book book = new Book();
        book.setId(20L);
        book.setTitle("AI Handbook");
        when(bookRepository.findByFacultyId(5L)).thenReturn(List.of(book));

        List<CourseMaterialSuggestion> results = recommendationService.suggestCourseMaterials(1L);

        assertFalse(results.isEmpty());
        assertEquals(20L, results.get(0).bookId());
        assertEquals("AI 101", results.get(0).courseContext());
    }

    @Test
    void suggestCourseMaterials_ShouldThrowException_WhenCourseNotFound() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> recommendationService.suggestCourseMaterials(1L));
    }

    @Test
    void predictDemand_ShouldReturnPredictions() {
        Book book = new Book();
        book.setId(30L);
        book.setTitle("SQL Pro");
        when(bookRepository.findAll()).thenReturn(List.of(book));
        when(issueRecordRepository.countByBookId(30L)).thenReturn(25L);

        List<DemandPrediction> results = recommendationService.predictDemand();

        assertFalse(results.isEmpty());
        assertEquals(30L, results.get(0).bookId());
        assertTrue(results.get(0).predictedDemandCount() > 25);
        assertEquals("HIGH", results.get(0).riskLevel());
    }
}
