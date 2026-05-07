package com.scholario.analytics.resolver;

import com.scholario.analytics.dto.BookUsageAnalytics;
import com.scholario.analytics.dto.CourseMaterialStats;
import com.scholario.analytics.dto.FacultyPerformance;
import com.scholario.analytics.dto.StudentEngagement;
import com.scholario.analytics.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsResolverTest {

    @Mock
    private AnalyticsService analyticsService;

    @InjectMocks
    private AnalyticsResolver analyticsResolver;

    @Test
    void getBookUsageAnalytics_ShouldDelegateToService() {
        BookUsageAnalytics response = new BookUsageAnalytics(1L, "Title", 5L, 3L, 10L);
        when(analyticsService.getBookUsageAnalytics(1L)).thenReturn(response);

        BookUsageAnalytics result = analyticsResolver.getBookUsageAnalytics(1L);

        assertEquals(response, result);
        verify(analyticsService).getBookUsageAnalytics(1L);
    }

    @Test
    void getCourseMaterialStats_ShouldDelegateToService() {
        CourseMaterialStats response = new CourseMaterialStats(1L, "CS101", 10L, 7L, 3L, 0.85);
        when(analyticsService.getCourseMaterialStats(1L)).thenReturn(response);

        CourseMaterialStats result = analyticsResolver.getCourseMaterialStats(1L);

        assertEquals(response, result);
        verify(analyticsService).getCourseMaterialStats(1L);
    }

    @Test
    void getFacultyPerformance_ShouldDelegateToService() {
        FacultyPerformance response = new FacultyPerformance(1L, "Dr. Smith", 3L, 2L, 20L);
        when(analyticsService.getFacultyPerformance(1L)).thenReturn(response);

        FacultyPerformance result = analyticsResolver.getFacultyPerformance(1L);

        assertEquals(response, result);
        verify(analyticsService).getFacultyPerformance(1L);
    }

    @Test
    void getStudentEngagement_ShouldDelegateToService() {
        StudentEngagement response = new StudentEngagement(1L, "John Doe", 4L, 15L, 2L);
        when(analyticsService.getStudentEngagement(1L)).thenReturn(response);

        StudentEngagement result = analyticsResolver.getStudentEngagement(1L);

        assertEquals(response, result);
        verify(analyticsService).getStudentEngagement(1L);
    }
}
