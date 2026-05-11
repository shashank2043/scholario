package com.scholario.auth.resolver;

import com.scholario.auth.dto.AuthResponse;
import com.scholario.auth.dto.LoginInput;
import com.scholario.auth.service.AuthService;
import com.scholario.user.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthMutationResolverTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthMutationResolver authMutationResolver;

    @Test
    void login_ShouldDelegateToService() {
        LoginInput input = new LoginInput("user", "pass");
        AuthResponse response = new AuthResponse("at", "rt", "Bearer", 3600, new User());
        when(authService.login(input)).thenReturn(response);

        AuthResponse result = authMutationResolver.login(input);

        assertNotNull(result);
        verify(authService).login(input);
    }

    @Test
    void refreshToken_ShouldDelegateToService() {
        authMutationResolver.refreshToken("rt");
        verify(authService).refreshToken("rt");
    }

    @Test
    void logout_ShouldDelegateToService() {
        when(authService.logout()).thenReturn(true);
        boolean result = authMutationResolver.logout();
        assertTrue(result);
        verify(authService).logout();
    }
}
