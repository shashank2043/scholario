package com.scholario.app.exception;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.GraphQlExceptionHandler;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;

import org.springframework.context.ApplicationEventPublisher;
import com.scholario.violation.event.AccessDeniedEvent;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@ControllerAdvice
public class GlobalGraphQlExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalGraphQlExceptionHandler.class);
    private final ApplicationEventPublisher eventPublisher;
    private static final String ANONYMOUS_USER = "anonymous";

    public GlobalGraphQlExceptionHandler(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @GraphQlExceptionHandler
    public GraphQLError handleIllegalArgumentException(IllegalArgumentException ex, DataFetchingEnvironment env) {
        logger.warn("Validation error: {}", ex.getMessage());
        return GraphqlErrorBuilder.newError(env)
                .message(ex.getMessage())
                .errorType(ErrorType.BAD_REQUEST)
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleIllegalStateException(IllegalStateException ex, DataFetchingEnvironment env) {
        logger.warn("State error: {}", ex.getMessage());
        return GraphqlErrorBuilder.newError(env)
                .message(ex.getMessage())
                .errorType(ErrorType.BAD_REQUEST)
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleAccessDeniedException(AccessDeniedException ex, DataFetchingEnvironment env) {
        Authentication auth = getAuthentication(env);
        String username = auth != null ? auth.getName() : ANONYMOUS_USER;
        String path = env.getExecutionStepInfo().getPath().toString();
        String operation = env.getOperationDefinition().getOperation().name();
        
        logger.warn("Access denied for user '{}' at path '{}' [{}]", username, path, operation);
        
        eventPublisher.publishEvent(new AccessDeniedEvent(
            username,
            path,
            operation,
            "unknown"
        ));

        String message = ex.getMessage();
        String code = "FORBIDDEN";

        if (auth != null && auth.isAuthenticated()) {
            java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = auth.getAuthorities();
            
            boolean hasUnassigned = authorities.stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .anyMatch(a -> a.equalsIgnoreCase("ROLE_UNASSIGNED") || a.equalsIgnoreCase("UNASSIGNED"));
            
            boolean hasOtherRoles = authorities.stream()
                    .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                    .anyMatch(a -> !a.equalsIgnoreCase("ROLE_UNASSIGNED") && 
                                  !a.equalsIgnoreCase("UNASSIGNED") &&
                                  !a.equalsIgnoreCase("ROLE_ANONYMOUS") &&
                                  !a.equalsIgnoreCase("ANONYMOUS") &&
                                  !a.toUpperCase().startsWith("SCOPE_") &&
                                  !a.toUpperCase().startsWith("OIDC_"));

            if (hasUnassigned && !hasOtherRoles) {
                message = "Access denied: Your account is pending role assignment by an administrator.";
                code = "UNASSIGNED_ACCESS_DENIED";
            }
        }

        return GraphqlErrorBuilder.newError(env)
                .message(message)
                .errorType(ErrorType.FORBIDDEN)
                .extensions(java.util.Map.of("code", code))
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleBadCredentialsException(org.springframework.security.authentication.BadCredentialsException ex, DataFetchingEnvironment env) {
        logger.warn("Bad credentials attempt: {}", ex.getMessage());
        
        String attemptedUsername = extractUsernameFromArgs(env);
        
        eventPublisher.publishEvent(new AccessDeniedEvent(
            attemptedUsername,
            env.getExecutionStepInfo().getPath().toString(),
            env.getOperationDefinition().getOperation().name(),
            "unknown"
        ));

        return GraphqlErrorBuilder.newError(env)
                .message("Invalid username or password")
                .errorType(ErrorType.UNAUTHORIZED)
                .build();
    }

    @GraphQlExceptionHandler
    public GraphQLError handleException(Exception ex, DataFetchingEnvironment env) {
        if (logger.isErrorEnabled()) {
            logger.error("Unexpected error for user '{}'", getUsername(env), ex);
        }
        return GraphqlErrorBuilder.newError(env)
                .message("An unexpected error occurred. Please contact support.")
                .errorType(ErrorType.INTERNAL_ERROR)
                .build();
    }

    private String extractUsernameFromArgs(DataFetchingEnvironment env) {
        Object input = env.getArgument("input");
        if (input instanceof java.util.Map<?, ?> map) {
            Object username = map.get("username");
            if (username instanceof String s) {
                return s;
            }
        }
        return ANONYMOUS_USER;
    }

    private String getUsername(DataFetchingEnvironment env) {
        Authentication auth = getAuthentication(env);
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals(ANONYMOUS_USER)) {
            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
                return userDetails.getUsername();
            }
            return auth.getName();
        }
        return ANONYMOUS_USER;
    }

    private Authentication getAuthentication(DataFetchingEnvironment env) {
        // Priority 1: Check SecurityContext from GraphQL Context (Bridge from Interceptor)
        Authentication auth = env.getGraphQlContext().get("auth");
        
        // Priority 2: Check standard Spring Security context in GraphQL Context
        if (auth == null) {
            org.springframework.security.core.context.SecurityContext securityContext = 
                env.getGraphQlContext().get(org.springframework.security.core.context.SecurityContext.class);
            if (securityContext != null) {
                auth = securityContext.getAuthentication();
            }
        }

        // Priority 3: Fallback to ThreadLocal SecurityContextHolder
        if (auth == null || auth.getName().equals(ANONYMOUS_USER)) {
            auth = SecurityContextHolder.getContext().getAuthentication();
        }

        return auth;
    }
}
