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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewMutationResolverTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewMutationResolver reviewMutationResolver;

    private ReviewRecord pendingRecord;
    private ReviewRecord approvedRecord;
    private ReviewRecord rejectedRecord;
    private ReviewRecord changesRequestedRecord;

    @BeforeEach
    void setUp() {
        pendingRecord = new ReviewRecord();
        pendingRecord.setId(1L);
        pendingRecord.setBookId(10L);
        pendingRecord.setReviewerId(2L);
        pendingRecord.setStatus(new Pending());
        pendingRecord.setFeedback(null);
        pendingRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        pendingRecord.setUpdatedAt(LocalDateTime.now().minusDays(1));

        approvedRecord = new ReviewRecord();
        approvedRecord.setId(1L);
        approvedRecord.setBookId(10L);
        approvedRecord.setReviewerId(2L);
        approvedRecord.setStatus(new Approved());
        approvedRecord.setFeedback("Looks good!");
        approvedRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        approvedRecord.setUpdatedAt(LocalDateTime.now());

        rejectedRecord = new ReviewRecord();
        rejectedRecord.setId(1L);
        rejectedRecord.setBookId(10L);
        rejectedRecord.setReviewerId(2L);
        rejectedRecord.setStatus(new Rejected());
        rejectedRecord.setFeedback("Needs major revisions");
        rejectedRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        rejectedRecord.setUpdatedAt(LocalDateTime.now());

        changesRequestedRecord = new ReviewRecord();
        changesRequestedRecord.setId(1L);
        changesRequestedRecord.setBookId(10L);
        changesRequestedRecord.setReviewerId(2L);
        changesRequestedRecord.setStatus(new ChangesRequested());
        changesRequestedRecord.setFeedback("Please add more examples");
        changesRequestedRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        changesRequestedRecord.setUpdatedAt(LocalDateTime.now());
    }

    // ========== submitBookForReview Tests ==========

    @Test
    void submitBookForReview_ShouldReturnResponse_WhenSuccessful() {
        Long bookId = 10L;
        Long reviewerId = 2L;
        when(reviewService.submitBookForReview(bookId, reviewerId)).thenReturn(pendingRecord);

        ReviewResponse result = reviewMutationResolver.submitBookForReview(bookId, reviewerId);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals(10L, result.bookId());
        assertEquals(2L, result.reviewerId());
        assertEquals("PENDING", result.status());
        assertNull(result.feedback());
        verify(reviewService, times(1)).submitBookForReview(bookId, reviewerId);
    }

    @Test
    void submitBookForReview_ShouldPassCorrectArgumentsToService() {
        Long bookId = 99L;
        Long reviewerId = 55L;
        when(reviewService.submitBookForReview(bookId, reviewerId)).thenReturn(pendingRecord);

        reviewMutationResolver.submitBookForReview(bookId, reviewerId);

        verify(reviewService, times(1)).submitBookForReview(99L, 55L);
    }

    @Test
    void submitBookForReview_ShouldReturnCorrectResponse_WhenRecordExists() {
        Long bookId = 10L;
        Long reviewerId = 2L;
        when(reviewService.submitBookForReview(bookId, reviewerId)).thenReturn(pendingRecord);

        ReviewResponse result = reviewMutationResolver.submitBookForReview(bookId, reviewerId);

        assertNotNull(result);
        assertEquals("PENDING", result.status());
        verify(reviewService, times(1)).submitBookForReview(bookId, reviewerId);
    }

    // ========== approveBook Tests ==========

    @Test
    void approveBook_ShouldReturnResponse_WhenSuccessful() {
        Long requestId = 1L;
        String feedback = "Approved";
        when(reviewService.approveBook(requestId, feedback)).thenReturn(approvedRecord);

        ReviewResponse result = reviewMutationResolver.approveBook(requestId, feedback);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("APPROVED", result.status());
        assertEquals("Looks good!", result.feedback());
        verify(reviewService, times(1)).approveBook(requestId, feedback);
    }

    @Test
    void approveBook_ShouldPassCorrectArgumentsToService() {
        Long requestId = 5L;
        String feedback = "Great work!";
        when(reviewService.approveBook(requestId, feedback)).thenReturn(approvedRecord);

        reviewMutationResolver.approveBook(requestId, feedback);

        verify(reviewService, times(1)).approveBook(5L, "Great work!");
    }

    @Test
    void approveBook_ShouldHandleNullFeedback() {
        Long requestId = 1L;
        when(reviewService.approveBook(requestId, null)).thenReturn(approvedRecord);

        ReviewResponse result = reviewMutationResolver.approveBook(requestId, null);

        assertNotNull(result);
        assertEquals("APPROVED", result.status());
        verify(reviewService, times(1)).approveBook(1L, null);
    }

    // ========== rejectBook Tests ==========

    @Test
    void rejectBook_ShouldReturnResponse_WhenSuccessful() {
        Long requestId = 1L;
        String feedback = "Rejected";
        when(reviewService.rejectBook(requestId, feedback)).thenReturn(rejectedRecord);

        ReviewResponse result = reviewMutationResolver.rejectBook(requestId, feedback);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("REJECTED", result.status());
        assertEquals("Needs major revisions", result.feedback());
        verify(reviewService, times(1)).rejectBook(requestId, feedback);
    }

    @Test
    void rejectBook_ShouldPassCorrectArgumentsToService() {
        Long requestId = 7L;
        String feedback = "Not suitable";
        when(reviewService.rejectBook(requestId, feedback)).thenReturn(rejectedRecord);

        reviewMutationResolver.rejectBook(requestId, feedback);

        verify(reviewService, times(1)).rejectBook(7L, "Not suitable");
    }

    @Test
    void rejectBook_ShouldHandleEmptyFeedback() {
        Long requestId = 1L;
        when(reviewService.rejectBook(requestId, "")).thenReturn(rejectedRecord);

        ReviewResponse result = reviewMutationResolver.rejectBook(requestId, "");

        assertNotNull(result);
        assertEquals("REJECTED", result.status());
        verify(reviewService, times(1)).rejectBook(1L, "");
    }

    // ========== requestChanges Tests ==========

    @Test
    void requestChanges_ShouldReturnResponse_WhenSuccessful() {
        Long requestId = 1L;
        String feedback = "Please add more examples";
        when(reviewService.requestChanges(requestId, feedback)).thenReturn(changesRequestedRecord);

        ReviewResponse result = reviewMutationResolver.requestChanges(requestId, feedback);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("CHANGES_REQUESTED", result.status());
        assertEquals("Please add more examples", result.feedback());
        verify(reviewService, times(1)).requestChanges(requestId, feedback);
    }

    @Test
    void requestChanges_ShouldPassCorrectArgumentsToService() {
        Long requestId = 3L;
        String feedback = "Needs revision";
        when(reviewService.requestChanges(requestId, feedback)).thenReturn(changesRequestedRecord);

        reviewMutationResolver.requestChanges(requestId, feedback);

        verify(reviewService, times(1)).requestChanges(3L, "Needs revision");
    }

    @Test
    void requestChanges_ShouldHandleDetailedFeedback() {
        Long requestId = 1L;
        String feedback = "Please add more code examples and fix the introduction";
        when(reviewService.requestChanges(requestId, feedback)).thenReturn(changesRequestedRecord);

        ReviewResponse result = reviewMutationResolver.requestChanges(requestId, feedback);

        assertNotNull(result);
        assertEquals("CHANGES_REQUESTED", result.status());
        verify(reviewService, times(1)).requestChanges(1L, "Please add more code examples and fix the introduction");
    }

    // ========== Integration-like Tests ==========

    @Test
    void submitBookForReview_ShouldReturnPendingStatus() {
        Long bookId = 10L;
        Long reviewerId = 2L;
        when(reviewService.submitBookForReview(bookId, reviewerId)).thenReturn(pendingRecord);

        ReviewResponse result = reviewMutationResolver.submitBookForReview(bookId, reviewerId);

        assertEquals("PENDING", result.status());
        assertNull(result.feedback());
    }

    @Test
    void approveBook_ShouldReturnApprovedStatus() {
        Long requestId = 1L;
        when(reviewService.approveBook(requestId, "Approved")).thenReturn(approvedRecord);

        ReviewResponse result = reviewMutationResolver.approveBook(requestId, "Approved");

        assertEquals("APPROVED", result.status());
        assertNotNull(result.feedback());
    }

    @Test
    void rejectBook_ShouldReturnRejectedStatus() {
        Long requestId = 1L;
        when(reviewService.rejectBook(requestId, "Rejected")).thenReturn(rejectedRecord);

        ReviewResponse result = reviewMutationResolver.rejectBook(requestId, "Rejected");

        assertEquals("REJECTED", result.status());
        assertNotNull(result.feedback());
    }

    @Test
    void requestChanges_ShouldReturnChangesRequestedStatus() {
        Long requestId = 1L;
        when(reviewService.requestChanges(requestId, "Changes")).thenReturn(changesRequestedRecord);

        ReviewResponse result = reviewMutationResolver.requestChanges(requestId, "Changes");

        assertEquals("CHANGES_REQUESTED", result.status());
        assertNotNull(result.feedback());
    }
}
