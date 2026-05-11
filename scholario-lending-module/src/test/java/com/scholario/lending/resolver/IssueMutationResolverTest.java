package com.scholario.lending.resolver;

import com.scholario.lending.dto.IssueInput;
import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.service.IssueService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueMutationResolverTest {

    @Mock
    private IssueService issueService;

    @InjectMocks
    private IssueMutationResolver issueMutationResolver;

    @Test
    void issueBook_Success() {
        IssueInput input = new IssueInput(1L, 1L);
        IssueRecord issueRecord = new IssueRecord();
        when(issueService.issueBook(input)).thenReturn(issueRecord);

        IssueRecord result = issueMutationResolver.issueBook(input);

        assertEquals(issueRecord, result);
        verify(issueService).issueBook(input);
    }
}
