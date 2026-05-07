package com.scholario.auth.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.scholario.auth.dto.AuthResponse;
import com.scholario.auth.dto.LoginInput;
import com.scholario.auth.dto.TokenValidationResponse;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.STUDENT);
    }

    @Test
    void login_Success() {
        LoginInput input = new LoginInput("testuser", "password");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtService.generateAccessToken(testUser)).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(testUser)).thenReturn("refreshToken");

        AuthResponse response = authService.login(input);

        assertNotNull(response);
        assertEquals("accessToken", response.accessToken());
        assertEquals("refreshToken", response.refreshToken());
        assertEquals("testuser", response.user().getUsername());
    }

    @Test
    void login_InvalidUser_ThrowsException() {
        LoginInput input = new LoginInput("invalid", "password");
        when(userRepository.findByUsername("invalid")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(input));
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        LoginInput input = new LoginInput("testuser", "wrong");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong", "encodedPassword")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(input));
    }

    @Test
    void refreshToken_Success() {
        String refreshToken = "validRefreshToken";
        DecodedJWT decodedJWT = mock(DecodedJWT.class);
        when(jwtService.validateToken(refreshToken)).thenReturn(decodedJWT);
        when(decodedJWT.getSubject()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(testUser)).thenReturn("newAccessToken");
        when(jwtService.generateRefreshToken(testUser)).thenReturn("newRefreshToken");

        AuthResponse response = authService.refreshToken(refreshToken);

        assertNotNull(response);
        assertEquals("newAccessToken", response.accessToken());
        assertEquals("newRefreshToken", response.refreshToken());
        verify(jwtService).validateToken(refreshToken);
    }

    @Test
    void validateToken_ValidToken() {
        String token = "validToken";
        DecodedJWT decodedJWT = mock(DecodedJWT.class);
        when(jwtService.validateToken(token)).thenReturn(decodedJWT);
        when(decodedJWT.getSubject()).thenReturn("testuser");
        when(decodedJWT.getClaim("role")).thenReturn(mock(com.auth0.jwt.interfaces.Claim.class));
        when(decodedJWT.getClaim("role").asString()).thenReturn("STUDENT");
        when(decodedJWT.getExpiresAt()).thenReturn(new Date());

        TokenValidationResponse response = authService.validateToken(token);

        assertTrue(response.valid());
        assertEquals("testuser", response.username());
    }

    @Test
    void validateToken_InvalidToken() {
        String token = "invalidToken";
        when(jwtService.validateToken(token)).thenThrow(new RuntimeException("Invalid token"));

        TokenValidationResponse response = authService.validateToken(token);

        assertFalse(response.valid());
        assertNull(response.username());
    }
}
