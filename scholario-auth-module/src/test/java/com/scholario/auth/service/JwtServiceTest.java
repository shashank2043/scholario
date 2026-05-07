package com.scholario.auth.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.scholario.user.model.Role;
import com.scholario.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "test-secret-key-test-secret-key-test-secret-key");
        ReflectionTestUtils.setField(jwtService, "accessTokenExpirationMs", 3600000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpirationMs", 604800000L);

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.STUDENT);
    }

    @Test
    void generateAccessToken_ShouldCreateValidToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertNotNull(token);

        DecodedJWT decodedJWT = jwtService.validateToken(token);
        assertEquals("testuser", decodedJWT.getSubject());
        assertEquals("STUDENT", decodedJWT.getClaim("role").asString());
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        String token = jwtService.generateRefreshToken(testUser);
        assertNotNull(token);

        DecodedJWT decodedJWT = jwtService.validateToken(token);
        assertEquals("testuser", decodedJWT.getSubject());
    }

    @Test
    void validateToken_ShouldThrowException_WhenTokenInvalid() {
        assertThrows(Exception.class, () -> jwtService.validateToken("invalidToken"));
    }

    @Test
    void getUsernameFromToken_ShouldReturnCorrectUsername() {
        String token = jwtService.generateAccessToken(testUser);
        String username = jwtService.getUsernameFromToken(token);
        assertEquals("testuser", username);
    }
}
