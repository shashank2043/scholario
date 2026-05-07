package com.scholario.violation.resolver;

import com.scholario.violation.model.ViolationReport;
import com.scholario.violation.service.ViolationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MisuseQueryResolverTest {

    @Mock
    private ViolationService violationService;

    @InjectMocks
    private MisuseQueryResolver misuseQueryResolver;

    @Test
    void detectUnauthorizedAccess_ShouldDelegateToService() {
        ViolationReport report = new ViolationReport();
        when(violationService.detectUnauthorizedAccess()).thenReturn(List.of(report));

        List<ViolationReport> results = misuseQueryResolver.detectUnauthorizedAccess();

        assertEquals(1, results.size());
        verify(violationService).detectUnauthorizedAccess();
    }

    @Test
    void analyzeUsagePatterns_ShouldDelegateToService() {
        when(violationService.analyzeUsagePatterns()).thenReturn(List.of());

        List<ViolationReport> results = misuseQueryResolver.analyzeUsagePatterns();

        assertEquals(0, results.size());
        verify(violationService).analyzeUsagePatterns();
    }

    @Test
    void getViolationReports_ShouldDelegateToService() {
        ViolationReport report = new ViolationReport();
        when(violationService.getViolationReports("user1")).thenReturn(List.of(report));

        List<ViolationReport> results = misuseQueryResolver.getViolationReports("user1");

        assertEquals(1, results.size());
        verify(violationService).getViolationReports("user1");
    }
}
