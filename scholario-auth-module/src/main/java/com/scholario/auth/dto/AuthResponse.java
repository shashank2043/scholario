package com.scholario.auth.dto;

import com.scholario.user.model.User;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    int expiresIn,
    User user
) {}
