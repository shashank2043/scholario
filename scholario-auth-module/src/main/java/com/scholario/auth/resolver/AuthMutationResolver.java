package com.scholario.auth.resolver;

import com.scholario.auth.dto.AuthResponse;
import com.scholario.auth.dto.LoginInput;
import com.scholario.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AuthMutationResolver {

    private final AuthService authService;

    @MutationMapping
    public AuthResponse login(@Argument LoginInput input) {
        return authService.login(input);
    }

    @MutationMapping
    public AuthResponse refreshToken(@Argument String refreshToken) {
        return authService.refreshToken(refreshToken);
    }

    @MutationMapping
    @PreAuthorize("isAuthenticated()")
    public boolean logout() {
        return authService.logout();
    }
}
