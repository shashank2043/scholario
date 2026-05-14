package com.scholario.lending.resolver;

import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.service.IssueService;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class IssueQueryResolver {

    private final IssueService issueService;
    private final UserService userService;

    @QueryMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN')")
    public List<IssueRecord> getMyIssuedBooks() {
        return issueService.getIssuedBooksByUser(userService.getCurrentUserId());
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN')")
    public List<IssueRecord> getMyIssueHistory() {
        return issueService.getIssueHistory(userService.getCurrentUserId());
    }

    @QueryMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<IssueRecord> getDueDates() {
        return issueService.getDueDates();
    }
}
