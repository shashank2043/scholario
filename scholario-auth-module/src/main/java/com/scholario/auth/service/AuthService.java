package com.scholario.auth.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.scholario.auth.dto.AuthResponse;
import com.scholario.auth.dto.LoginInput;
import com.scholario.auth.dto.TokenValidationResponse;
import com.scholario.user.model.User;
import com.scholario.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginInput input) {
        User user = userRepository.findByUsername(input.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(input.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600, // matching default expiration in JwtService
                user
        );
    }

    public AuthResponse refreshToken(String refreshToken) {
        DecodedJWT decodedJWT = jwtService.validateToken(refreshToken);
        String username = decodedJWT.getSubject();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        String accessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                newRefreshToken,
                "Bearer",
                3600,
                user
        );
    }

    public TokenValidationResponse validateToken(String token) {
        try {
            DecodedJWT decodedJWT = jwtService.validateToken(token);
            return new TokenValidationResponse(
                    true,
                    decodedJWT.getSubject(),
                    decodedJWT.getClaim("role").asString(),
                    decodedJWT.getExpiresAt().toString()
            );
        } catch (Exception e) {
            return new TokenValidationResponse(false, null, null, null);
        }
    }

    public boolean logout() {
        // In a stateless JWT setup, logout is usually handled on the client by deleting the token.
        // Server-side logout could involve token blacklisting, but for this simulation, we'll just return true.
        return true;
    }
}
