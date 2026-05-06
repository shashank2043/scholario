package com.scholario.auth.dto;

public record TokenValidationResponse(
    boolean valid,
    String username,
    String role,
    String expiresAt
) {}
