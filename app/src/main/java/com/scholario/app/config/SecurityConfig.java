package com.scholario.app.config;

import com.scholario.auth.security.JwtAuthenticationFilter;
import com.scholario.auth.security.KeycloakJwtAuthenticationConverter;
import com.scholario.auth.security.KeycloakUserSyncFilter;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final KeycloakUserSyncFilter keycloakUserSyncFilter;
    
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

        try {
            org.springframework.http.client.SimpleClientHttpRequestFactory requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(5000); // Reduced timeout for faster failure
            requestFactory.setReadTimeout(5000);
            
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(requestFactory);
            
            log.info("Attempting to initialize Keycloak JwtDecoder with issuer: {}", issuerUri);
            JwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation(issuerUri)
                    .restOperations(restTemplate)
                    .build();
            log.info("Keycloak JwtDecoder initialized successfully.");
            return decoder;
        } catch (Exception e) {
            log.warn("Keycloak is unreachable or misconfigured. Keycloak authentication will be unavailable. Error: {}", e.getMessage());
            return null;
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
                        "/graphql",
                        "/h2-console/**",
                        "/graphiql/**",
                        "/favicon.ico:1",
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
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
