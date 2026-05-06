package com.scholario.royalty.dto;

import java.math.BigDecimal;
import java.util.Map;

public record RoyaltyPolicyInput(
    Long bookId,
    Long facultyId,
    BigDecimal royaltyPercentage,
    Map<String, Object> sharingModel
) {}
