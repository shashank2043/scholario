package com.scholario.lending.dto;

import java.util.List;

public record BulkIssueInput(
        List<Long> bookIds,
        Long userId
) {
}
