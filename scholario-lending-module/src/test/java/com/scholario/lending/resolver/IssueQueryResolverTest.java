package com.scholario.lending.resolver;

import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.service.IssueService;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueQueryResolverTest {

    @Mock
    private IssueService issueService;

    @Mock
    private UserService userService;

    @InjectMocks
    private IssueQueryResolver issueQueryResolver;

    @Test
    void getMyIssuedBooks_Success() {
        List<IssueRecord> issues = List.of(new IssueRecord());
        when(userService.getCurrentUserId()).thenReturn(1L);
        when(issueService.getIssuedBooksByUser(1L)).thenReturn(issues);

        List<IssueRecord> result = issueQueryResolver.getMyIssuedBooks();

        assertEquals(issues, result);
        verify(userService).getCurrentUserId();
        verify(issueService).getIssuedBooksByUser(1L);
    }
}
