package com.scholario.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

/**
 * Filter that prevents users with ONLY the UNASSIGNED role from accessing protected resources.
 */
@Component
public class UnassignedRoleFilter extends OncePerRequestFilter {

    private final List<String> publicPaths = List.of(
            "/graphql",
            "/h2-console",
            "/graphiql",
            "/favicon.ico",
            "/assets/",
            "/favicon.svg",
            "/graphiql-local",
            "/monacoeditorwork"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() && !isPublicResource(request)) {
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            
            boolean hasUnassigned = authorities.stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_UNASSIGNED"));
            boolean hasOtherRoles = authorities.stream()
                    .anyMatch(a -> !a.getAuthority().equals("ROLE_UNASSIGNED"));

            if (hasUnassigned && !hasOtherRoles) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"errors\":[{\"message\":\"Access denied: Your account is pending role assignment by an administrator.\",\"extensions\":{\"code\":\"UNASSIGNED_ACCESS_DENIED\"}}]}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicResource(HttpServletRequest request) {
        String path = request.getRequestURI();
        return publicPaths.stream().anyMatch(publicPath -> path.startsWith(publicPath));
    }
}
