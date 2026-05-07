package com.scholario.content.resolver;

import com.scholario.content.dto.DigitalContentInput;
import com.scholario.content.model.ContentAccessLog;
import com.scholario.content.model.ContentAccessType;
import com.scholario.content.model.DigitalContent;
import com.scholario.content.service.DigitalContentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DigitalContentResolverTest {

    @Mock
    private DigitalContentService digitalContentService;

    @InjectMocks
    private DigitalContentResolver digitalContentResolver;

    private DigitalContent digitalContent;
    private ContentAccessLog contentAccessLog;
    private DigitalContentInput input;

    @BeforeEach
    void setUp() {
        digitalContent = DigitalContent.builder()
                .id(1L)
                .bookId(10L)
                .contentType("PDF")
                .contentUrl("http://example.com/book.pdf")
                .drmEnforced(true)
                .build();

        contentAccessLog = ContentAccessLog.builder()
                .id(1L)
                .contentId(1L)
                .userId(20L)
                .accessType(ContentAccessType.VIEW)
                .build();

        input = new DigitalContentInput();
        input.setBookId(10L);
        input.setContentType("PDF");
        input.setContentUrl("http://example.com/book.pdf");
        input.setDrmEnforced(true);
    }

    @Test
    void getDigitalContent_ShouldReturnContent() {
        when(digitalContentService.getDigitalContent(1L)).thenReturn(digitalContent);

        DigitalContent result = digitalContentResolver.getDigitalContent(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(10L, result.getBookId());
        verify(digitalContentService, times(1)).getDigitalContent(1L);
    }

    @Test
    void getAccessLogs_ShouldReturnLogsByContentId() {
        when(digitalContentService.getAccessLogs(1L)).thenReturn(List.of(contentAccessLog));

        List<ContentAccessLog> results = digitalContentResolver.getAccessLogs(1L);

        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).getContentId());
        verify(digitalContentService, times(1)).getAccessLogs(1L);
    }

    @Test
    void getAccessLogs_ShouldReturnAllLogs_WhenContentIdIsNull() {
        when(digitalContentService.getAccessLogs(null)).thenReturn(List.of(contentAccessLog));

        List<ContentAccessLog> results = digitalContentResolver.getAccessLogs(null);

        assertEquals(1, results.size());
        verify(digitalContentService, times(1)).getAccessLogs(null);
    }

    @Test
    void uploadDigitalContent_ShouldReturnSavedContent() {
        when(digitalContentService.uploadDigitalContent(any(DigitalContentInput.class))).thenReturn(digitalContent);

        DigitalContent result = digitalContentResolver.uploadDigitalContent(input);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("PDF", result.getContentType());
        verify(digitalContentService, times(1)).uploadDigitalContent(input);
    }

    @Test
    void grantAccess_ShouldReturnAccessLog() {
        when(digitalContentService.grantAccess(1L, 20L)).thenReturn(contentAccessLog);

        ContentAccessLog result = digitalContentResolver.grantAccess(1L, 20L);

        assertNotNull(result);
        assertEquals(ContentAccessType.VIEW, result.getAccessType());
        verify(digitalContentService, times(1)).grantAccess(1L, 20L);
    }

    @Test
    void revokeAccess_ShouldReturnTrue() {
        when(digitalContentService.revokeAccess(1L, 20L)).thenReturn(true);

        boolean result = digitalContentResolver.revokeAccess(1L, 20L);

        assertTrue(result);
        verify(digitalContentService, times(1)).revokeAccess(1L, 20L);
    }

    @Test
    void revokeAccess_ShouldReturnFalse() {
        when(digitalContentService.revokeAccess(1L, 20L)).thenReturn(false);

        boolean result = digitalContentResolver.revokeAccess(1L, 20L);

        assertFalse(result);
        verify(digitalContentService, times(1)).revokeAccess(1L, 20L);
    }
}