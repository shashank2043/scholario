package com.scholario.review.service;

import com.scholario.book.model.Draft;
import com.scholario.book.model.Published;
import com.scholario.book.service.BookService;
import com.scholario.review.model.*;
import com.scholario.review.repository.ReviewHistoryRepository;
import com.scholario.review.repository.ReviewRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRecordRepository reviewRecordRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final BookService bookService;

    public ReviewService(ReviewRecordRepository reviewRecordRepository,
                         ReviewHistoryRepository reviewHistoryRepository,
                         BookService bookService) {
        this.reviewRecordRepository = reviewRecordRepository;
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.bookService = bookService;
    }

    @Transactional
    public ReviewRecord submitBookForReview(Long bookId, Long reviewerId) {
        // 1. Transition Book State to REVIEW
        bookService.submitForReview(bookId);

        // 2. Create or Update Review Record
        ReviewRecord record = reviewRecordRepository.findByBookId(bookId)
                .orElse(new ReviewRecord());
        
        record.setBookId(bookId);
        record.setReviewerId(reviewerId);
        record.setStatus(new Pending());
        record.setFeedback(null);
        
        ReviewRecord savedRecord = reviewRecordRepository.save(record);

        // 3. Add to History
        addHistory(savedRecord, new Pending(), "Book submitted for review", reviewerId);

        return savedRecord;
    }

    @Transactional
    public ReviewRecord approveBook(Long requestId, String feedback) {
        ReviewRecord record = reviewRecordRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Review record not found"));

        // 1. Update Review Record
        record.setStatus(new Approved());
        record.setFeedback(feedback);
        ReviewRecord savedRecord = reviewRecordRepository.save(record);

        // 2. Transition Book State to PUBLISHED
        bookService.publishBook(record.getBookId());

        // 3. Add to History
        addHistory(savedRecord, new Approved(), feedback, record.getReviewerId());

        return savedRecord;
    }

    @Transactional
    public ReviewRecord rejectBook(Long requestId, String feedback) {
        ReviewRecord record = reviewRecordRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Review record not found"));

        record.setStatus(new Rejected());
        record.setFeedback(feedback);
        ReviewRecord savedRecord = reviewRecordRepository.save(record);

        // Optional: Transition Book State? Requirements don't specify. 
        // Let's keep it in REVIEW or move to ARCHIVED? 
        // Based on BookState.java, Review can go to Archived or Draft.
        // Let's assume Rejection means it's Archived for now, or just stays in REVIEW.
        // Actually, let's just leave it in REVIEW and the user can archive it if they want.
        // Or better, move back to DRAFT for major changes? That's requestChanges.
        // Let's move to ARCHIVED for Reject.
        bookService.archiveBook(record.getBookId());

        addHistory(savedRecord, new Rejected(), feedback, record.getReviewerId());

        return savedRecord;
    }

    @Transactional
    public ReviewRecord requestChanges(Long requestId, String feedback) {
        ReviewRecord record = reviewRecordRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Review record not found"));

        record.setStatus(new ChangesRequested());
        record.setFeedback(feedback);
        ReviewRecord savedRecord = reviewRecordRepository.save(record);

        // Transition Book back to DRAFT
        bookService.updateBookState(record.getBookId(), new Draft());

        addHistory(savedRecord, new ChangesRequested(), feedback, record.getReviewerId());

        return savedRecord;
    }

    public Optional<ReviewRecord> getReviewStatus(Long bookId) {
        return reviewRecordRepository.findByBookId(bookId);
    }

    public List<ReviewHistory> getReviewHistory(Long bookId) {
        return reviewRecordRepository.findByBookId(bookId)
                .map(record -> reviewHistoryRepository.findByReviewRecordIdOrderByTimestampDesc(record.getId()))
                .orElse(List.of());
    }

    private void addHistory(ReviewRecord record, ReviewStatus status, String feedback, Long performedBy) {
        ReviewHistory history = new ReviewHistory();
        history.setReviewRecordId(record.getId());
        history.setStatus(status);
        history.setFeedback(feedback);
        history.setPerformedBy(performedBy);
        reviewHistoryRepository.save(history);
    }
}
