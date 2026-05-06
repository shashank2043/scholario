package com.scholario.review.service;

import com.scholario.book.model.Book;
import com.scholario.book.model.Draft;
import com.scholario.book.model.Review;
import com.scholario.book.service.BookService;
import com.scholario.review.model.Approved;
import com.scholario.review.model.Pending;
import com.scholario.review.model.ReviewRecord;
import com.scholario.review.repository.ReviewHistoryRepository;
import com.scholario.review.repository.ReviewRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ReviewServiceTest {

    @Mock
    private ReviewRecordRepository reviewRecordRepository;
    @Mock
    private ReviewHistoryRepository reviewHistoryRepository;
    @Mock
    private BookService bookService;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reviewService = new ReviewService(reviewRecordRepository, reviewHistoryRepository, bookService);
    }

    @Test
    void testSubmitBookForReview() {
        Long bookId = 1L;
        Long reviewerId = 2L;
        Book book = new Book();
        book.setId(bookId);
        book.setState(new Draft());

        when(bookService.submitForReview(bookId)).thenReturn(book);
        when(reviewRecordRepository.findByBookId(bookId)).thenReturn(Optional.empty());
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(i -> i.getArguments()[0]);

        ReviewRecord result = reviewService.submitBookForReview(bookId, reviewerId);

        assertNotNull(result);
        assertEquals(bookId, result.getBookId());
        assertEquals(reviewerId, result.getReviewerId());
        assertTrue(result.getStatus() instanceof Pending);
        verify(bookService).submitForReview(bookId);
        verify(reviewHistoryRepository).save(any());
    }

    @Test
    void testApproveBook() {
        Long requestId = 10L;
        Long bookId = 1L;
        ReviewRecord record = new ReviewRecord();
        record.setId(requestId);
        record.setBookId(bookId);
        record.setReviewerId(2L);
        record.setStatus(new Pending());

        when(reviewRecordRepository.findById(requestId)).thenReturn(Optional.of(record));
        when(reviewRecordRepository.save(any(ReviewRecord.class))).thenAnswer(i -> i.getArguments()[0]);

        ReviewRecord result = reviewService.approveBook(requestId, "Looks good!");

        assertNotNull(result);
        assertTrue(result.getStatus() instanceof Approved);
        assertEquals("Looks good!", result.getFeedback());
        verify(bookService).publishBook(bookId);
        verify(reviewHistoryRepository).save(any());
    }
}
