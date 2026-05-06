package com.scholario.user.dto;

import com.scholario.user.model.Role;

public record UserInput (
    String username,
    String email,
    String fullName,
    String password,
    Role role
){}
