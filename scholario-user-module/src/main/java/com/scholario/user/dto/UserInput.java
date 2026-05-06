package com.scholario.user.dto;

import com.scholario.user.model.Role;
import lombok.Data;

public record UserInput (
    String username,
    String email,
    String fullName,
    Role role
){}
