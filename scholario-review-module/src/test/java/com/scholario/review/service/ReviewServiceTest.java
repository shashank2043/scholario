package com.scholario.review.service;

import com.scholario.book.model.Book;
import com.scholario.book.model.Draft;
import com.scholario.book.model.Review;
import com.scholario.book.service.BookService;
import com.scholario.review.model.*;
import com.scholario.review.repository.ReviewHistoryRepository;
import com.scholario.review.repository.ReviewRecordRepository;
import com.scholario.user.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRecordRepository reviewRecordRepository;

    @Mock
    private ReviewHistoryRepository reviewHistoryRepository;

    @Mock
    private BookService bookService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReviewService reviewService;

    private ReviewRecord existingRecord;
    private Book draftBook;
    private Book reviewBook;

    @BeforeEach
    void setUp() {
        existingRecord = new ReviewRecord();
        existingRecord.setId(1L);
        existingRecord.setBookId(10L);
        existingRecord.setReviewerId(2L);
        existingRecord.setStatus(new Pending());
        existingRecord.setFeedback(null);
        existingRecord.setCreatedAt(LocalDateTime.now().minusDays(1));
        existingRecord.setUpdatedAt(LocalDateTime.now().minusDays(1));

        draftBook = new Book();
        draftBook.setId(10L);
        draftBook.setState(new Draft());

        reviewBook = new Book();
        reviewBook.setId(10L);
        reviewBook.setState(new Review());

        lenient().when(userRepository.existsById(anyLong())).thenReturn(true);
    }

    // ========== submitBookForReview Tests ==========

    @Test
    void submitBookForReview_ShouldCreateNewRecord_WhenRecordDoesNotExist() {
        Long bookId = 10L;
        Long reviewerId = 2L;

        when(bookService.submitForReview(bookId)).thenReturn(reviewBook);
        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> {
            ReviewRecord r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewRecord result = reviewService.submitBookForReview(bookId, reviewerId);

        assertNotNull(result);
        assertEquals(bookId, result.getBookId());
        assertEquals(reviewerId, result.getReviewerId());
        assertTrue(result.getStatus() instanceof Pending);
        assertNull(result.getFeedback());
        verify(bookService, times(1)).submitForReview(bookId);
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
        verify(reviewRecordRepository, times(1)).save(any(ReviewRecord.class));
        verify(reviewHistoryRepository, times(1)).save(any(ReviewHistory.class));
    }

    @Test
    void submitBookForReview_ShouldUpdateExistingRecord_WhenRecordExists() {
        Long bookId = 10L;
        Long reviewerId = 3L;

        when(bookService.submitForReview(bookId)).thenReturn(reviewBook);
        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenReturn(existingRecord);
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewRecord result = reviewService.submitBookForReview(bookId, reviewerId);

        assertNotNull(result);
        assertEquals(bookId, result.getBookId());
        assertEquals(reviewerId, result.getReviewerId());
        assertTrue(result.getStatus() instanceof Pending);
        verify(bookService, times(1)).submitForReview(bookId);
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
        verify(reviewRecordRepository, times(1)).save(any(ReviewRecord.class));
    }

    @Test
    void submitBookForReview_ShouldCallBookServiceSubmitForReview() {
        Long bookId = 10L;
        Long reviewerId = 2L;

        when(bookService.submitForReview(bookId)).thenReturn(reviewBook);
        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.submitBookForReview(bookId, reviewerId);

        verify(bookService, times(1)).submitForReview(bookId);
    }

    @Test
    void submitBookForReview_ShouldAddHistoryEntry() {
        Long bookId = 10L;
        Long reviewerId = 2L;

        when(bookService.submitForReview(bookId)).thenReturn(reviewBook);
        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> {
            ReviewRecord r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.submitBookForReview(bookId, reviewerId);

        verify(reviewHistoryRepository, times(1)).save(any(ReviewHistory.class));
    }

    // ========== approveBook Tests ==========

    @Test
    void approveBook_ShouldUpdateStatusToApproved() {
        Long requestId = 1L;
        String feedback = "Looks good!";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewRecord result = reviewService.approveBook(requestId, feedback);

        assertNotNull(result);
        assertTrue(result.getStatus() instanceof Approved);
        assertEquals(feedback, result.getFeedback());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, times(1)).save(any(ReviewRecord.class));
        verify(bookService, times(1)).publishBook(existingRecord.getBookId());
    }

    @Test
    void approveBook_ShouldCallBookServicePublishBook() {
        Long requestId = 1L;
        String feedback = "Approved";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.approveBook(requestId, feedback);

        verify(bookService, times(1)).publishBook(existingRecord.getBookId());
    }

    @Test
    void approveBook_ShouldThrowException_WhenRecordNotFound() {
        Long requestId = 99L;

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> reviewService.approveBook(requestId, "feedback"));

        assertEquals("Review record not found", exception.getMessage());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, never()).save(any(ReviewRecord.class));
        verify(bookService, never()).publishBook(anyLong());
    }

    @Test
    void approveBook_ShouldThrowException_WhenRecordNotPending() {
        existingRecord.setStatus(new Approved());
        when(reviewRecordRepository.findById(1L)).thenReturn(Optional.of(existingRecord));

        assertThrows(IllegalStateException.class, () -> reviewService.approveBook(1L, "feedback"));
        verify(reviewRecordRepository, never()).save(any(ReviewRecord.class));
    }

    @Test
    void approveBook_ShouldAddHistoryEntry() {
        Long requestId = 1L;
        String feedback = "Approved";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.approveBook(requestId, feedback);

        verify(reviewHistoryRepository, times(1)).save(any(ReviewHistory.class));
    }

    // ========== rejectBook Tests ==========

    @Test
    void rejectBook_ShouldUpdateStatusToRejected() {
        Long requestId = 1L;
        String feedback = "Needs major revisions";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewRecord result = reviewService.rejectBook(requestId, feedback);

        assertNotNull(result);
        assertTrue(result.getStatus() instanceof Rejected);
        assertEquals(feedback, result.getFeedback());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, times(1)).save(any(ReviewRecord.class));
        verify(bookService, times(1)).archiveBook(existingRecord.getBookId());
    }

    @Test
    void rejectBook_ShouldCallBookServiceArchiveBook() {
        Long requestId = 1L;
        String feedback = "Rejected";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.rejectBook(requestId, feedback);

        verify(bookService, times(1)).archiveBook(existingRecord.getBookId());
    }

    @Test
    void rejectBook_ShouldThrowException_WhenRecordNotFound() {
        Long requestId = 99L;

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> reviewService.rejectBook(requestId, "feedback"));

        assertEquals("Review record not found", exception.getMessage());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, never()).save(any(ReviewRecord.class));
        verify(bookService, never()).archiveBook(anyLong());
    }

    @Test
    void rejectBook_ShouldThrowException_WhenFeedbackBlank() {
        when(reviewRecordRepository.findById(1L)).thenReturn(Optional.of(existingRecord));

        assertThrows(IllegalArgumentException.class, () -> reviewService.rejectBook(1L, " "));
        verify(reviewRecordRepository, never()).save(any(ReviewRecord.class));
    }

    @Test
    void rejectBook_ShouldAddHistoryEntry() {
        Long requestId = 1L;
        String feedback = "Rejected";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.rejectBook(requestId, feedback);

        verify(reviewHistoryRepository, times(1)).save(any(ReviewHistory.class));
    }

    // ========== requestChanges Tests ==========

    @Test
    void requestChanges_ShouldUpdateStatusToChangesRequested() {
        Long requestId = 1L;
        String feedback = "Please add more examples";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewRecord result = reviewService.requestChanges(requestId, feedback);

        assertNotNull(result);
        assertTrue(result.getStatus() instanceof ChangesRequested);
        assertEquals(feedback, result.getFeedback());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, times(1)).save(any(ReviewRecord.class));
    }

    @Test
    void requestChanges_ShouldCallBookServiceUpdateBookState() {
        Long requestId = 1L;
        String feedback = "Needs changes";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.requestChanges(requestId, feedback);

        verify(bookService, times(1)).updateBookState(existingRecord.getBookId(), new Draft());
    }

    @Test
    void requestChanges_ShouldThrowException_WhenRecordNotFound() {
        Long requestId = 99L;

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> reviewService.requestChanges(requestId, "feedback"));

        assertEquals("Review record not found", exception.getMessage());
        verify(reviewRecordRepository, times(1)).findById(requestId);
        verify(reviewRecordRepository, never()).save(any(ReviewRecord.class));
    }

    @Test
    void requestChanges_ShouldAddHistoryEntry() {
        Long requestId = 1L;
        String feedback = "Please revise";

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(existingRecord));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewHistoryRepository.save(any(ReviewHistory.class))).thenAnswer(inv -> inv.getArgument(0));

        reviewService.requestChanges(requestId, feedback);

        verify(reviewHistoryRepository, times(1)).save(any(ReviewHistory.class));
    }

    // ========== getReviewStatus Tests ==========

    @Test
    void getReviewStatus_ShouldReturnRecord_WhenRecordExists() {
        Long bookId = 10L;

        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.of(existingRecord));

        Optional<ReviewRecord> result = reviewService.getReviewStatus(bookId);

        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
        assertEquals(bookId, result.get().getBookId());
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
    }

    @Test
    void getReviewStatus_ShouldReturnEmpty_WhenRecordDoesNotExist() {
        Long bookId = 99L;

        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());

        Optional<ReviewRecord> result = reviewService.getReviewStatus(bookId);

        assertTrue(result.isEmpty());
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
    }

    // ========== getReviewHistory Tests ==========

    @Test
    void getReviewHistory_ShouldReturnHistory_WhenRecordExists() {
        Long bookId = 10L;
        ReviewHistory history1 = new ReviewHistory();
        history1.setId(1L);
        history1.setReviewRecordId(1L);
        history1.setStatus(new Pending());
        history1.setFeedback("Submitted");
        history1.setPerformedBy(2L);

        ReviewHistory history2 = new ReviewHistory();
        history2.setId(2L);
        history2.setReviewRecordId(1L);
        history2.setStatus(new Approved());
        history2.setFeedback("Approved");
        history2.setPerformedBy(2L);

        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.of(existingRecord));
        when(reviewHistoryRepository.findByReviewRecordIdOrderByTimestampDesc(1L))
                .thenReturn(List.of(history2, history1));

        List<ReviewHistory> result = reviewService.getReviewHistory(bookId);

        assertEquals(2, result.size());
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
        verify(reviewHistoryRepository, times(1)).findByReviewRecordIdOrderByTimestampDesc(1L);
    }

    @Test
    void getReviewHistory_ShouldReturnEmptyList_WhenRecordDoesNotExist() {
        Long bookId = 99L;

        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());

        List<ReviewHistory> result = reviewService.getReviewHistory(bookId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(reviewRecordRepository, times(1)).findByBookId(bookId);
        verify(reviewHistoryRepository, never()).findByReviewRecordIdOrderByTimestampDesc(anyLong());
    }

    @Test
    void getReviewHistory_ShouldReturnEmptyList_WhenNoHistoryExists() {
        Long bookId = 10L;

        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.of(existingRecord));
        when(reviewHistoryRepository.findByReviewRecordIdOrderByTimestampDesc(1L))
                .thenReturn(List.of());

        List<ReviewHistory> result = reviewService.getReviewHistory(bookId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
