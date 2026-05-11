package com.scholario.auth.resolver;

import com.scholario.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthQueryResolverTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthQueryResolver authQueryResolver;

    @Test
    void validateToken_ShouldDelegateToService() {
        authQueryResolver.validateToken("token");
        verify(authService).validateToken("token");
    }
}
