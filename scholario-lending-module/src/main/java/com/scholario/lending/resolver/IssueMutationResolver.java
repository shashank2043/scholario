package com.scholario.lending.resolver;

import com.scholario.lending.dto.BulkIssueInput;
import com.scholario.lending.dto.IssueInput;
import com.scholario.lending.dto.ReturnInput;
import com.scholario.lending.dto.RenewInput;
import com.scholario.lending.model.IssueRecord;
import com.scholario.lending.service.IssueService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class IssueMutationResolver {

    private final IssueService issueService;

    public IssueMutationResolver(IssueService issueService) {
        this.issueService = issueService;
    }

    @MutationMapping
    public IssueRecord issueBook(@Argument IssueInput input) {
        return issueService.issueBook(input);
    }

    @MutationMapping
    public IssueRecord returnBook(@Argument ReturnInput input) {
        return issueService.returnBook(input);
    }

    @MutationMapping
    public IssueRecord renewBook(@Argument RenewInput input) {
        return issueService.renewBook(input);
    }

    @MutationMapping
    public List<IssueRecord> bulkIssueBooks(@Argument BulkIssueInput input) {
        return issueService.bulkIssueBooks(input);
    }
}
