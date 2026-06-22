package com.scholario.app.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.graphql.server.webmvc.GraphiQlHandler;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
@Slf4j
public class GraphiQlConfiguration {

    @Bean
    @Order(0)
    public RouterFunction<ServerResponse> graphiQlRouterFunction() {
        RouterFunctions.Builder builder = RouterFunctions.route();
        ClassPathResource graphiQlPage = new ClassPathResource("static/graphiql-local/index.html");
        GraphiQlHandler handler = new GraphiQlHandler("/graphql-local", "", graphiQlPage);
        builder.GET("/graphiql-local", handler::handleRequest);
        log.info("GraphiQL interface available at /graphiql-local");
        return builder.build();
    }
}
