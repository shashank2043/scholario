package com.scholario.lending.service;

import com.scholario.lending.dto.BulkIssueInput;
import com.scholario.lending.dto.IssueInput;
import com.scholario.lending.dto.RenewInput;
import com.scholario.lending.dto.ReturnInput;
import com.scholario.lending.model.*;
import com.scholario.lending.repository.IssueRecordRepository;
import com.scholario.book.repository.BookRepository;
import com.scholario.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class IssueService {

    private final IssueRecordRepository issueRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private static final int MAX_BOOKS_PER_USER = 5;
    private static final int DEFAULT_ISSUE_DAYS = 14;
    private static final int MAX_RENEWALS = 2;
    private static final double PENALTY_PER_DAY = 1.0;
    private static final String STATE_RETURNED = "RETURNED";

    public IssueService(IssueRecordRepository issueRecordRepository,
                        BookRepository bookRepository,
                        UserRepository userRepository) {
        this.issueRecordRepository = issueRecordRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // Mutations

    public IssueRecord issueBook(IssueInput input) {
        validateBookAndUser(input.bookId(), input.userId());

        // Check max books per user
        List<IssueRecord> activeIssues = issueRecordRepository.findByUserIdAndStateTypeNot(input.userId(), STATE_RETURNED);
        if (activeIssues.size() >= MAX_BOOKS_PER_USER) {
            throw new IllegalStateException("User has reached maximum limit of " + MAX_BOOKS_PER_USER + " books");
        }

        // Check if book is already issued
        List<IssueRecord> bookIssues = issueRecordRepository.findByBookId(input.bookId());
        boolean isAlreadyIssued = bookIssues.stream()
                .anyMatch(i -> !(i.getState() instanceof Returned));
        if (isAlreadyIssued) {
            throw new IllegalStateException("Book is already issued");
        }

        LocalDateTime now = LocalDateTime.now();
        IssueRecord issue = new IssueRecord();
        issue.setBookId(input.bookId());
        issue.setUserId(input.userId());
        issue.setIssueDate(now);
        issue.setDueDate(now.plusDays(DEFAULT_ISSUE_DAYS));
        issue.setState(new Issued(now, now.plusDays(DEFAULT_ISSUE_DAYS)));
        issue.setRenewalCount(0);
        issue.setPenaltyAmount(0.0);

        return issueRecordRepository.save(issue);
    }

    public IssueRecord returnBook(ReturnInput input) {
        IssueRecord issue = issueRecordRepository.findByIdAndUserId(input.issueId(), input.userId())
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + input.issueId()));

        if (issue.getState() instanceof Returned) {
            throw new IllegalStateException("Book is already returned");
        }

        LocalDateTime now = LocalDateTime.now();
        issue.setReturnDate(now);

        double penalty = 0.0;
        if (issue.getDueDate() != null && now.isAfter(issue.getDueDate())) {
            long overdueDays = java.time.Duration.between(issue.getDueDate(), now).toDays() + 1;
            penalty = overdueDays * PENALTY_PER_DAY;
        }

        issue.setState(new Returned(now, penalty));
        issue.setPenaltyAmount(penalty);

        return issueRecordRepository.save(issue);
    }

    public IssueRecord renewBook(RenewInput input) {
        IssueRecord issue = issueRecordRepository.findByIdAndUserId(input.issueId(), input.userId())
                .orElseThrow(() -> new IllegalArgumentException("Issue not found with id: " + input.issueId()));

        if (!(issue.getState() instanceof Issued || issue.getState() instanceof Overdue)) {
            throw new IllegalStateException("Cannot renew book in " + issue.getState().name() + " state");
        }

        if (issue.getRenewalCount() >= MAX_RENEWALS) {
            throw new IllegalStateException("Maximum renewal limit of " + MAX_RENEWALS + " reached");
        }

        LocalDateTime now = LocalDateTime.now();
        issue.setIssueDate(now);
        issue.setDueDate(now.plusDays(DEFAULT_ISSUE_DAYS));
        issue.setState(new Issued(now, now.plusDays(DEFAULT_ISSUE_DAYS)));
        issue.setRenewalCount(issue.getRenewalCount() + 1);

        return issueRecordRepository.save(issue);
    }

    public List<IssueRecord> bulkIssueBooks(BulkIssueInput input) {
        List<IssueRecord> issued = new ArrayList<>();

        if (!userRepository.existsById(input.userId())) {
            throw new IllegalArgumentException("User not found with id: " + input.userId());
        }
        for (Long bookId : input.bookIds()) {
            if (!bookRepository.existsById(bookId)) {
                throw new IllegalArgumentException("Book not found with id: " + bookId);
            }
        }

        // Check max books per user
        List<IssueRecord> activeIssues = issueRecordRepository.findByUserIdAndStateTypeNot(input.userId(), STATE_RETURNED);
        int availableSlots = MAX_BOOKS_PER_USER - activeIssues.size();
        if (availableSlots < input.bookIds().size()) {
            throw new IllegalStateException("User can only issue " + availableSlots + " more books (max " + MAX_BOOKS_PER_USER + ")");
        }

        for (Long bookId : input.bookIds()) {
            // Check if book is already issued
            List<IssueRecord> bookIssues = issueRecordRepository.findByBookId(bookId);
            boolean isAlreadyIssued = bookIssues.stream()
                    .anyMatch(i -> !(i.getState() instanceof Returned));
            if (isAlreadyIssued) {
                throw new IllegalStateException("Book is already issued: " + bookId);
            }

            LocalDateTime now = LocalDateTime.now();
            IssueRecord issue = new IssueRecord();
            issue.setBookId(bookId);
            issue.setUserId(input.userId());
            issue.setIssueDate(now);
            issue.setDueDate(now.plusDays(DEFAULT_ISSUE_DAYS));
            issue.setState(new Issued(now, now.plusDays(DEFAULT_ISSUE_DAYS)));
            issue.setRenewalCount(0);
            issue.setPenaltyAmount(0.0);

            issued.add(issueRecordRepository.save(issue));
        }

        return issued;
    }

    // Queries

    public List<IssueRecord> getIssuedBooksByUser(Long userId) {
        return issueRecordRepository.findByUserIdAndStateTypeNot(userId, STATE_RETURNED);
    }

    public List<IssueRecord> getIssueHistory(Long userId) {
        return issueRecordRepository.findByUserId(userId);
    }

    public List<IssueRecord> getDueDates() {
        List<IssueRecord> active = new ArrayList<>(issueRecordRepository.findByStateType("ISSUED"));
        active.addAll(issueRecordRepository.findByStateType("OVERDUE"));
        return active;
    }

    // Helper to update overdue status (can be called by scheduled job)
    public void updateOverdueStatus() {
        List<IssueRecord> pastDue = issueRecordRepository.findByDueDateLessThanAndStateType(LocalDateTime.now(), "ISSUED");
        for (IssueRecord issue : pastDue) {
            if (issue.getState() instanceof Issued) {
                long overdueDays = java.time.Duration.between(issue.getDueDate(), LocalDateTime.now()).toDays() + 1;
                double penalty = overdueDays * PENALTY_PER_DAY;
                issue.setState(new Overdue(issue.getDueDate(), penalty));
                issue.setPenaltyAmount(penalty);
                issueRecordRepository.save(issue);
            }
        }
    }

    private void validateBookAndUser(Long bookId, Long userId) {
        if (!bookRepository.existsById(bookId)) {
            throw new IllegalArgumentException("Book not found with id: " + bookId);
        }
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
    }
}
