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
}
