package com.scholario.lending.service;

import com.scholario.lending.dto.IssueInput;
import com.scholario.lending.dto.ReturnInput;
import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.model.Issued;
import com.scholario.lending.model.Returned;
import com.scholario.lending.repository.IssueRecordRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock
    private IssueRecordRepository issueRecordRepository;

    @InjectMocks
    private IssueService issueService;

    private IssueRecord issueRecord;

    @BeforeEach
    void setUp() {
        issueRecord = new IssueRecord();
        issueRecord.setId(1L);
        issueRecord.setBookId(1L);
        issueRecord.setUserId(1L);
        issueRecord.setDueDate(LocalDateTime.now().plusDays(14));
        issueRecord.setState(new Issued(LocalDateTime.now(), LocalDateTime.now().plusDays(14)));
    }

    @Test
    void issueBook_Success() {
        IssueInput input = new IssueInput(1L, 1L);
        when(issueRecordRepository.findByUserIdAndStateTypeNot(1L, "RETURNED")).thenReturn(List.of());
        when(issueRecordRepository.findByBookId(1L)).thenReturn(List.of());
        when(issueRecordRepository.save(any(IssueRecord.class))).thenReturn(issueRecord);

        IssueRecord result = issueService.issueBook(input);

        assertNotNull(result);
        assertTrue(result.getState() instanceof Issued);
    }

    @Test
    void issueBook_Failure_MaxBooks() {
        IssueInput input = new IssueInput(1L, 1L);
        when(issueRecordRepository.findByUserIdAndStateTypeNot(1L, "RETURNED"))
                .thenReturn(List.of(new IssueRecord(), new IssueRecord(), new IssueRecord(), new IssueRecord(), new IssueRecord()));

        assertThrows(IllegalStateException.class, () -> issueService.issueBook(input));
    }

    @Test
    void returnBook_Success() {
        ReturnInput input = new ReturnInput(1L, 1L);
        when(issueRecordRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(issueRecord));
        when(issueRecordRepository.save(any(IssueRecord.class))).thenAnswer(i -> i.getArguments()[0]);

        IssueRecord result = issueService.returnBook(input);

        assertTrue(result.getState() instanceof Returned);
        assertNotNull(result.getReturnDate());
    }

    @Test
    void returnBook_Failure_AlreadyReturned() {
        issueRecord.setState(new Returned(LocalDateTime.now(), 0.0));
        ReturnInput input = new ReturnInput(1L, 1L);
        when(issueRecordRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(issueRecord));

        assertThrows(IllegalStateException.class, () -> issueService.returnBook(input));
    }
}
