package com.scholario.app.config;

import graphql.schema.DataFetcher;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.idl.SchemaDirectiveWiring;
import graphql.schema.idl.SchemaDirectiveWiringEnvironment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class GraphQLConfig {

    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder.directiveWiring(new SchemaDirectiveWiring() {
            @Override
            public GraphQLFieldDefinition onField(SchemaDirectiveWiringEnvironment<GraphQLFieldDefinition> environment) {
                var appliedDirective = environment.getAppliedDirective("auth");
                if (appliedDirective == null) {
                    return environment.getElement();
                }

                String targetRole = getTargetRole(appliedDirective);
                if (targetRole == null) {
                    return environment.getElement();
                }

                DataFetcher<?> originalDataFetcher = environment.getCodeRegistry().getDataFetcher(
                        (GraphQLObjectType) environment.getFieldsContainer(), 
                        environment.getFieldDefinition());
                
                DataFetcher<?> authDataFetcher = createAuthDataFetcher(originalDataFetcher, targetRole);
                
                environment.getCodeRegistry().dataFetcher(
                        (GraphQLObjectType) environment.getFieldsContainer(), 
                        environment.getFieldDefinition(), 
                        authDataFetcher);
                
                return environment.getElement();
            }

            private String getTargetRole(graphql.schema.GraphQLAppliedDirective directive) {
                var roleArg = directive.getArgument("role");
                if (roleArg != null && roleArg.getArgumentValue() != null && roleArg.getArgumentValue().getValue() != null) {
                    return roleArg.getArgumentValue().getValue().toString();
                }
                return null;
            }

            private DataFetcher<?> createAuthDataFetcher(DataFetcher<?> originalDataFetcher, String targetRole) {
                return dataFetchingEnvironment -> {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    
                    if (authentication == null || !authentication.isAuthenticated()) {
                        throw new AccessDeniedException("Unauthorized: Authentication required");
                    }
                    
                    boolean hasRole = authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_" + targetRole));
                    
                    if (!hasRole) {
                        throw new AccessDeniedException("Forbidden: Insufficient privileges");
                    }
                    
                    return originalDataFetcher.get(dataFetchingEnvironment);
                };
            }
        });
    }
}
