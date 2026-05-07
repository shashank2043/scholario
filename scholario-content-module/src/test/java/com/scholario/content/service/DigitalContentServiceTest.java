package com.scholario.content.service;

import com.scholario.content.dto.DigitalContentInput;
import com.scholario.content.model.ContentAccessLog;
import com.scholario.content.model.ContentAccessType;
import com.scholario.content.model.DigitalContent;
import com.scholario.content.model.UserContentAccess;
import com.scholario.content.repository.ContentAccessLogRepository;
import com.scholario.content.repository.DigitalContentRepository;
import com.scholario.content.repository.UserContentAccessRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DigitalContentServiceTest {

    @Mock
    private DigitalContentRepository digitalContentRepository;
    @Mock
    private ContentAccessLogRepository contentAccessLogRepository;
    @Mock
    private UserContentAccessRepository userContentAccessRepository;

    @InjectMocks
    private DigitalContentService digitalContentService;

    private DigitalContent content;
    private DigitalContentInput input;

    @BeforeEach
    void setUp() {
        content = DigitalContent.builder()
                .id(1L)
                .bookId(10L)
                .contentType("PDF")
                .contentUrl("http://example.com/book.pdf")
                .drmEnforced(true)
                .build();

        input = new DigitalContentInput();
        input.setBookId(10L);
        input.setContentType("PDF");
        input.setContentUrl("http://example.com/book.pdf");
        input.setDrmEnforced(true);
    }

    @Test
    void uploadDigitalContent_ShouldSaveContent() {
        when(digitalContentRepository.save(any(DigitalContent.class))).thenReturn(content);

        DigitalContent result = digitalContentService.uploadDigitalContent(input);

        assertNotNull(result);
        assertEquals(10L, result.getBookId());
        verify(digitalContentRepository).save(any(DigitalContent.class));
    }

    @Test
    void grantAccess_ShouldSaveUserContentAccess() {
        when(userContentAccessRepository.existsByUserIdAndContentId(1L, 1L)).thenReturn(false);
        when(contentAccessLogRepository.save(any(ContentAccessLog.class))).thenReturn(new ContentAccessLog());

        ContentAccessLog log = digitalContentService.grantAccess(1L, 1L);

        assertNotNull(log);
        verify(userContentAccessRepository).save(any(UserContentAccess.class));
        verify(contentAccessLogRepository).save(any(ContentAccessLog.class));
    }

    @Test
    void grantAccess_ShouldThrowException_WhenAccessAlreadyGranted() {
        when(userContentAccessRepository.existsByUserIdAndContentId(1L, 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> digitalContentService.grantAccess(1L, 1L));
    }

    @Test
    void hasAccess_ShouldReturnTrue_WhenAccessExists() {
        when(userContentAccessRepository.existsByUserIdAndContentId(1L, 1L)).thenReturn(true);

        boolean result = digitalContentService.hasAccess(1L, 1L);

        assertTrue(result);
    }

    @Test
    void hasAccess_ShouldReturnFalse_WhenAccessDoesNotExist() {
        when(userContentAccessRepository.existsByUserIdAndContentId(1L, 1L)).thenReturn(false);

        boolean result = digitalContentService.hasAccess(1L, 1L);

        assertFalse(result);
    }

    @Test
    void getDigitalContent_ShouldReturnContent_WhenFound() {
        when(digitalContentRepository.findById(1L)).thenReturn(Optional.of(content));

        DigitalContent result = digitalContentService.getDigitalContent(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(10L, result.getBookId());
        verify(digitalContentRepository, times(1)).findById(1L);
    }

    @Test
    void getDigitalContent_ShouldThrowException_WhenNotFound() {
        when(digitalContentRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> digitalContentService.getDigitalContent(99L));

        assertEquals("Digital content not found with id: 99", exception.getMessage());
        verify(digitalContentRepository, times(1)).findById(99L);
    }

    @Test
    void getAccessLogs_ShouldReturnLogsByContentId() {
        ContentAccessLog log1 = ContentAccessLog.builder()
                .id(1L)
                .contentId(1L)
                .userId(10L)
                .accessType(ContentAccessType.VIEW)
                .build();

        when(contentAccessLogRepository.findByContentId(1L)).thenReturn(List.of(log1));

        List<ContentAccessLog> logs = digitalContentService.getAccessLogs(1L);

        assertEquals(1, logs.size());
        assertEquals(1L, logs.get(0).getContentId());
        verify(contentAccessLogRepository, times(1)).findByContentId(1L);
        verify(contentAccessLogRepository, never()).findAll();
    }

    @Test
    void getAccessLogs_ShouldReturnAllLogs_WhenContentIdIsNull() {
        ContentAccessLog log1 = ContentAccessLog.builder()
                .id(1L)
                .contentId(1L)
                .userId(10L)
                .accessType(ContentAccessType.VIEW)
                .build();
        ContentAccessLog log2 = ContentAccessLog.builder()
                .id(2L)
                .contentId(2L)
                .userId(11L)
                .accessType(ContentAccessType.DOWNLOAD)
                .build();

        when(contentAccessLogRepository.findAll()).thenReturn(List.of(log1, log2));

        List<ContentAccessLog> logs = digitalContentService.getAccessLogs(null);

        assertEquals(2, logs.size());
        verify(contentAccessLogRepository, times(1)).findAll();
        verify(contentAccessLogRepository, never()).findByContentId(anyLong());
    }

    @Test
    void revokeAccess_ShouldReturnTrue() {
        doNothing().when(userContentAccessRepository).deleteByUserIdAndContentId(1L, 1L);

        boolean result = digitalContentService.revokeAccess(1L, 1L);

        assertTrue(result);
        verify(userContentAccessRepository, times(1)).deleteByUserIdAndContentId(1L, 1L);
    }

    @Test
    void logAccess_ShouldSaveAndReturnLog() {
        ContentAccessLog savedLog = ContentAccessLog.builder()
                .id(1L)
                .contentId(1L)
                .userId(10L)
                .accessType(ContentAccessType.DOWNLOAD)
                .build();

        when(contentAccessLogRepository.save(any(ContentAccessLog.class))).thenReturn(savedLog);

        ContentAccessLog result = digitalContentService.logAccess(1L, 10L, ContentAccessType.DOWNLOAD);

        assertNotNull(result);
        assertEquals(1L, result.getContentId());
        assertEquals(10L, result.getUserId());
        assertEquals(ContentAccessType.DOWNLOAD, result.getAccessType());
        verify(contentAccessLogRepository, times(1)).save(any(ContentAccessLog.class));
    }

    @Test
    void grantAccess_ShouldSaveUserContentAccessAndLogAccess() {
        when(userContentAccessRepository.existsByUserIdAndContentId(1L, 1L)).thenReturn(false);
        when(userContentAccessRepository.save(any(UserContentAccess.class)))
                .thenReturn(UserContentAccess.builder().id(1L).userId(1L).contentId(1L).build());
        when(contentAccessLogRepository.save(any(ContentAccessLog.class)))
                .thenReturn(ContentAccessLog.builder().id(1L).contentId(1L).userId(1L).accessType(ContentAccessType.VIEW).build());

        ContentAccessLog result = digitalContentService.grantAccess(1L, 1L);

        assertNotNull(result);
        assertEquals(ContentAccessType.VIEW, result.getAccessType());
        verify(userContentAccessRepository, times(1)).save(any(UserContentAccess.class));
        verify(contentAccessLogRepository, times(1)).save(any(ContentAccessLog.class));
    }

    @Test
    void uploadDigitalContent_ShouldSetFieldsCorrectly() {
        DigitalContent savedContent = DigitalContent.builder()
                .id(1L)
                .bookId(input.getBookId())
                .contentType(input.getContentType())
                .contentUrl(input.getContentUrl())
                .drmEnforced(input.isDrmEnforced())
                .build();

        when(digitalContentRepository.save(any(DigitalContent.class))).thenReturn(savedContent);

        DigitalContent result = digitalContentService.uploadDigitalContent(input);

        assertNotNull(result);
        assertEquals(10L, result.getBookId());
        assertEquals("PDF", result.getContentType());
        assertEquals("http://example.com/book.pdf", result.getContentUrl());
        assertTrue(result.isDrmEnforced());
        verify(digitalContentRepository, times(1)).save(any(DigitalContent.class));
    }
}
