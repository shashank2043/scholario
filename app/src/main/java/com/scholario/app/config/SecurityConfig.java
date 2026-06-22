package com.scholario.app.config;

import com.scholario.auth.security.JwtAuthenticationFilter;
import com.scholario.auth.security.KeycloakJwtAuthenticationConverter;
import com.scholario.auth.security.KeycloakUserSyncFilter;
import com.scholario.auth.security.UnassignedRoleFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Optional;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final KeycloakUserSyncFilter keycloakUserSyncFilter;
    private final UnassignedRoleFilter unassignedRoleFilter;
    
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${scholario.security.keycloak.enabled:true}")
    private boolean keycloakEnabled;

    @Bean
    public JwtDecoder jwtDecoder() {
        if (!keycloakEnabled) {
            log.info("Keycloak authentication is explicitly disabled via configuration.");
            return null;
        }

        log.info("Initializing Keycloak JwtDecoder with issuer: {}", issuerUri);
        // Using withIssuerLocation is standard, but if it fails at startup, we can fallback to JWK Set URI 
        // to avoid returning null and disabling the resource server entirely.
        try {
            return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
        } catch (Exception e) {
            log.warn("Could not initialize JwtDecoder via discovery. Fallback to JWK Set URI might be needed. Error: {}", e.getMessage());
            // Fallback: try to construct the JWK Set URI manually from issuer URI
            String jwkSetUri = issuerUri + "/protocol/openid-connect/certs";
            log.info("Attempting fallback to JWK Set URI: {}", jwkSetUri);
            return NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-requested-with"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver resolver = new DefaultBearerTokenResolver();
        return request -> {
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                return null;
            }
            return resolver.resolve(request);
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, Optional<JwtDecoder> jwtDecoder) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/h2-console/**",
                        "/graphiql/**",
                        "/favicon.ico",
                        "/assets/**",
                        "/favicon.svg",
                        "/graphiql-local/**",
                        "/monacoeditorwork/**"
                ).permitAll()
                .anyRequest().authenticated()
            );

        if (jwtDecoder.isPresent()) {
            http.oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(bearerTokenResolver())
                .jwt(jwt -> jwt.jwtAuthenticationConverter(new KeycloakJwtAuthenticationConverter()))
            )
            .addFilterAfter(keycloakUserSyncFilter, BearerTokenAuthenticationFilter.class);
        } else {
            log.info("Configuring security without Keycloak support.");
        }

        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(unassignedRoleFilter, AuthorizationFilter.class);

        return http.build();
    }
}
