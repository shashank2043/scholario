package com.scholario.auth.resolver;

import com.scholario.auth.dto.TokenValidationResponse;
import com.scholario.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AuthQueryResolver {

    private final AuthService authService;

    @QueryMapping
    public TokenValidationResponse validateToken(@Argument String token) {
        return authService.validateToken(token);
    }
}
