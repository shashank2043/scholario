package com.scholario.lending.resolver;

import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.service.IssueService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
public class IssueQueryResolver {

    private final IssueService issueService;

    public IssueQueryResolver(IssueService issueService) {
        this.issueService = issueService;
    }

    @QueryMapping
    public List<IssueRecord> getIssuedBooksByUser(@Argument Long userId) {
        return issueService.getIssuedBooksByUser(userId);
    }

    @QueryMapping
    public List<IssueRecord> getIssueHistory(@Argument Long userId) {
        return issueService.getIssueHistory(userId);
    }

    @QueryMapping
    public List<IssueRecord> getDueDates() {
        return issueService.getDueDates();
    }
}
