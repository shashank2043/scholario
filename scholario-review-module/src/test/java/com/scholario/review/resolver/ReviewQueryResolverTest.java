package com.scholario.review.resolver;

import com.scholario.review.dto.ReviewResponse;
import com.scholario.review.model.*;
import com.scholario.review.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewQueryResolverTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewQueryResolver reviewQueryResolver;

    private ReviewRecord reviewRecord;
    private ReviewHistory history1;
    private ReviewHistory history2;

    @BeforeEach
    void setUp() {
        reviewRecord = new ReviewRecord();
        reviewRecord.setId(1L);
        reviewRecord.setBookId(10L);
        reviewRecord.setReviewerId(2L);
        reviewRecord.setStatus(new Pending());
        reviewRecord.setFeedback("Pending review");
        reviewRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        reviewRecord.setUpdatedAt(LocalDateTime.now().minusDays(1));

        history1 = new ReviewHistory();
        history1.setId(1L);
        history1.setReviewRecordId(1L);
        history1.setStatus(new Pending());
        history1.setFeedback("Submitted for review");
        history1.setPerformedBy(2L);
        history1.setTimestamp(LocalDateTime.now().minusDays(1));

        history2 = new ReviewHistory();
        history2.setId(2L);
        history2.setReviewRecordId(1L);
        history2.setStatus(new Approved());
        history2.setFeedback("Approved");
        history2.setPerformedBy(2L);
        history2.setTimestamp(LocalDateTime.now());
    }

    @Test
    void getReviewStatus_ShouldReturnResponse_WhenRecordExists() {
        Long bookId = 10L;
        when(reviewService.getReviewStatus(bookId)).thenReturn(Optional.of(reviewRecord));

        ReviewResponse result = reviewQueryResolver.getReviewStatus(bookId);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals(10L, result.bookId());
        assertEquals(2L, result.reviewerId());
        assertEquals("PENDING", result.status());
        assertEquals("Pending review", result.feedback());
        verify(reviewService, times(1)).getReviewStatus(bookId);
    }

    @Test
    void getReviewStatus_ShouldReturnNull_WhenRecordDoesNotExist() {
        Long bookId = 99L;
        when(reviewService.getReviewStatus(bookId)).thenReturn(Optional.empty());

        ReviewResponse result = reviewQueryResolver.getReviewStatus(bookId);

        assertNull(result);
        verify(reviewService, times(1)).getReviewStatus(bookId);
    }

    @Test
    void getReviewStatus_ShouldReturnCorrectStatus_WhenApproved() {
        Long bookId = 10L;
        reviewRecord.setStatus(new Approved());
        reviewRecord.setFeedback("Looks good");
        when(reviewService.getReviewStatus(bookId)).thenReturn(Optional.of(reviewRecord));

        ReviewResponse result = reviewQueryResolver.getReviewStatus(bookId);

        assertNotNull(result);
        assertEquals("APPROVED", result.status());
        assertEquals("Looks good", result.feedback());
    }

    @Test
    void getReviewStatus_ShouldReturnCorrectStatus_WhenRejected() {
        Long bookId = 10L;
        reviewRecord.setStatus(new Rejected());
        reviewRecord.setFeedback("Needs work");
        when(reviewService.getReviewStatus(bookId)).thenReturn(Optional.of(reviewRecord));

        ReviewResponse result = reviewQueryResolver.getReviewStatus(bookId);

        assertNotNull(result);
        assertEquals("REJECTED", result.status());
        assertEquals("Needs work", result.feedback());
    }

    @Test
    void getReviewStatus_ShouldReturnCorrectStatus_WhenChangesRequested() {
        Long bookId = 10L;
        reviewRecord.setStatus(new ChangesRequested());
        reviewRecord.setFeedback("Please add more examples");
        when(reviewService.getReviewStatus(bookId)).thenReturn(Optional.of(reviewRecord));

        ReviewResponse result = reviewQueryResolver.getReviewStatus(bookId);

        assertNotNull(result);
        assertEquals("CHANGES_REQUESTED", result.status());
        assertEquals("Please add more examples", result.feedback());
    }

    @Test
    void getReviewHistory_ShouldReturnHistoryList_WhenHistoryExists() {
        Long bookId = 10L;
        when(reviewService.getReviewHistory(bookId)).thenReturn(List.of(history2, history1));

        List<ReviewQueryResolver.ReviewHistoryResponse> results = reviewQueryResolver.getReviewHistory(bookId);

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(2L, results.get(0).id());
        assertEquals("APPROVED", results.get(0).status());
        assertEquals(1L, results.get(1).id());
        assertEquals("PENDING", results.get(1).status());
        verify(reviewService, times(1)).getReviewHistory(bookId);
    }

    @Test
    void getReviewHistory_ShouldReturnEmptyList_WhenNoHistoryExists() {
        Long bookId = 10L;
        when(reviewService.getReviewHistory(bookId)).thenReturn(List.of());

        List<ReviewQueryResolver.ReviewHistoryResponse> results = reviewQueryResolver.getReviewHistory(bookId);

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(reviewService, times(1)).getReviewHistory(bookId);
    }

    @Test
    void getReviewHistory_ShouldMapFieldsCorrectly() {
        Long bookId = 10L;
        when(reviewService.getReviewHistory(bookId)).thenReturn(List.of(history1));

        List<ReviewQueryResolver.ReviewHistoryResponse> results = reviewQueryResolver.getReviewHistory(bookId);

        assertEquals(1, results.size());
        assertEquals(1L, results.get(0).id());
        assertEquals(1L, results.get(0).reviewRecordId());
        assertEquals("PENDING", results.get(0).status());
        assertEquals("Submitted for review", results.get(0).feedback());
        assertEquals(2L, results.get(0).performedBy());
        assertNotNull(results.get(0).timestamp());
    }

    @Test
    void getReviewHistory_ShouldHandleMultipleHistoryEntries() {
        Long bookId = 10L;
        ReviewHistory history3 = new ReviewHistory();
        history3.setId(3L);
        history3.setReviewRecordId(1L);
        history3.setStatus(new ChangesRequested());
        history3.setFeedback("Changes requested");
        history3.setPerformedBy(2L);
        history3.setTimestamp(LocalDateTime.now().minusDays(2));

        when(reviewService.getReviewHistory(bookId)).thenReturn(List.of(history3, history2, history1));

        List<ReviewQueryResolver.ReviewHistoryResponse> results = reviewQueryResolver.getReviewHistory(bookId);

        assertEquals(3, results.size());
        verify(reviewService, times(1)).getReviewHistory(bookId);
    }
}