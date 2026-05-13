package com.scholario.review.service;

import com.scholario.book.model.Draft;
import com.scholario.book.model.Published;
import com.scholario.book.service.BookService;
import com.scholario.review.model.*;
import com.scholario.review.repository.ReviewHistoryRepository;
import com.scholario.review.repository.ReviewRecordRepository;
import com.scholario.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private static final String REVIEW_RECORD_NOT_FOUND = "Review record not found";
    private final ReviewRecordRepository reviewRecordRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final BookService bookService;
    private final UserRepository userRepository;

    public ReviewService(ReviewRecordRepository reviewRecordRepository,
                         ReviewHistoryRepository reviewHistoryRepository,
                         BookService bookService,
                         UserRepository userRepository) {
        this.reviewRecordRepository = reviewRecordRepository;
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.bookService = bookService;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewRecord submitBookForReview(Long bookId, Long reviewerId) {
        if (!userRepository.existsById(reviewerId)) {
            throw new IllegalArgumentException("Reviewer not found with id: " + reviewerId);
        }

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
                .orElseThrow(() -> new IllegalArgumentException(REVIEW_RECORD_NOT_FOUND));
        validatePending(record);

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
        ReviewRecord reviewRecord = reviewRecordRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException(REVIEW_RECORD_NOT_FOUND));
        validatePending(reviewRecord);
        validateFeedback(feedback);

        reviewRecord.setStatus(new Rejected());
        reviewRecord.setFeedback(feedback);
        ReviewRecord savedRecord = reviewRecordRepository.save(reviewRecord);

        // Final rejection leads to archiving
        bookService.archiveBook(reviewRecord.getBookId());

        addHistory(savedRecord, new Rejected(), feedback, reviewRecord.getReviewerId());

        return savedRecord;
    }

    @Transactional
    public ReviewRecord requestChanges(Long requestId, String feedback) {
        ReviewRecord reviewRecord = reviewRecordRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException(REVIEW_RECORD_NOT_FOUND));
        validatePending(reviewRecord);
        validateFeedback(feedback);

        reviewRecord.setStatus(new ChangesRequested());
        reviewRecord.setFeedback(feedback);
        ReviewRecord savedRecord = reviewRecordRepository.save(reviewRecord);

        // Transition Book back to DRAFT
        bookService.updateBookState(reviewRecord.getBookId(), new Draft());

        addHistory(savedRecord, new ChangesRequested(), feedback, reviewRecord.getReviewerId());

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

    private void addHistory(ReviewRecord reviewRecord, ReviewStatus status, String feedback, Long performedBy) {
        ReviewHistory history = new ReviewHistory();
        history.setReviewRecordId(reviewRecord.getId());
        history.setStatus(status);
        history.setFeedback(feedback);
        history.setPerformedBy(performedBy);
        reviewHistoryRepository.save(history);
    }

    private void validatePending(ReviewRecord reviewRecord) {
        if (!(reviewRecord.getStatus() instanceof Pending)) {
            throw new IllegalStateException("Review record must be pending");
        }
    }

    private void validateFeedback(String feedback) {
        if (feedback == null || feedback.isBlank()) {
            throw new IllegalArgumentException("Feedback is required");
        }
    }
}
