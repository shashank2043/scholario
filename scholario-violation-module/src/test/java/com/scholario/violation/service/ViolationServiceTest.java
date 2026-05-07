package com.scholario.violation.service;

import com.scholario.violation.model.*;
import com.scholario.violation.repository.AccessLogRepository;
import com.scholario.violation.repository.ViolationReportRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViolationServiceTest {

    @Mock
    private AccessLogRepository accessLogRepository;

    @Mock
    private ViolationReportRepository violationReportRepository;

    @InjectMocks
    private ViolationService violationService;

    @Test
    void logAccess_ShouldSaveAccessLog() {
        violationService.logAccess("user1", "resource1", "READ", true, "127.0.0.1");

        verify(accessLogRepository, times(1)).save(any(AccessLog.class));
    }

    @Test
    void detectUnauthorizedAccess_ShouldGenerateReportsForSuspiciousUsers() {
        Object[] suspiciousData = new Object[]{"hacker", 10L};
        List<Object[]> results = Collections.singletonList(suspiciousData);
        when(accessLogRepository.findUsersWithExcessiveDeniedAccess(any(LocalDateTime.class), eq(5L)))
                .thenReturn(results);
        
        when(violationReportRepository.save(any(ViolationReport.class))).thenAnswer(i -> i.getArguments()[0]);

        List<ViolationReport> reports = violationService.detectUnauthorizedAccess();

        assertEquals(1, reports.size());
        assertEquals("hacker", reports.get(0).getUsername());
        assertEquals(ViolationType.ACCESS_ABUSE, reports.get(0).getType());
        assertEquals(ViolationSeverity.HIGH, reports.get(0).getSeverity());
        assertTrue(reports.get(0).getDescription().contains("10"));
        
        verify(violationReportRepository, times(1)).save(any(ViolationReport.class));
    }

    @Test
    void getViolationReports_WithUsername_ShouldReturnUserReports() {
        ViolationReport report = new ViolationReport();
        report.setUsername("user1");
        when(violationReportRepository.findByUsername("user1")).thenReturn(List.of(report));

        List<ViolationReport> results = violationService.getViolationReports("user1");

        assertEquals(1, results.size());
        assertEquals("user1", results.get(0).getUsername());
    }

    @Test
    void getViolationReports_WithNullUsername_ShouldReturnAllReports() {
        ViolationReport report = new ViolationReport();
        when(violationReportRepository.findAll()).thenReturn(List.of(report));

        List<ViolationReport> results = violationService.getViolationReports(null);

        assertEquals(1, results.size());
    }
}
