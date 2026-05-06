package com.scholario.review.dto;

import com.scholario.review.model.ReviewStatus;
import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    Long bookId,
    Long reviewerId,
    String status,
    String feedback,
    String createdAt,
    String updatedAt
) {}
