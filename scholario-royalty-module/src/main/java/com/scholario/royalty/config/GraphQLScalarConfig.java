package com.scholario.royalty.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.GraphQLContext;
import graphql.execution.CoercedVariables;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.io.IOException;
import java.util.Locale;

@Configuration
public class GraphQLScalarConfig {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static final GraphQLScalarType JSON_SCALAR = GraphQLScalarType.newScalar()
            .name("JSON")
            .description("JSON scalar type for dynamic map/object values")
            .coercing(new Coercing<JsonNode, String>() {
                @Override
                public String serialize(Object dataFetcherResult, GraphQLContext context, Locale locale) throws CoercingSerializeException {
                    if (dataFetcherResult instanceof JsonNode) {
                        return dataFetcherResult.toString();
                    }
                    if (dataFetcherResult instanceof java.util.Map) {
                        try {
                            return objectMapper.writeValueAsString(dataFetcherResult);
                        } catch (IOException e) {
                            throw new CoercingSerializeException("Failed to serialize map to JSON", e);
                        }
                    }
                    return dataFetcherResult.toString();
                }

                @Override
                public JsonNode parseValue(Object input, GraphQLContext context, Locale locale) throws CoercingParseValueException {
                    if (input instanceof String s) {
                        try {
                            return objectMapper.readTree(s);
                        } catch (IOException e) {
                            throw new CoercingParseValueException("Failed to parse JSON string", e);
                        }
                    }
                    if (input instanceof java.util.Map) {
                        return objectMapper.convertValue(input, JsonNode.class);
                    }
                    throw new CoercingParseValueException("Expected JSON string or map");
                }

                @Override
                public JsonNode parseLiteral(Value<?> input, CoercedVariables variables, GraphQLContext context, Locale locale) throws CoercingParseLiteralException {
                    if (input instanceof StringValue stringValue) {
                        try {
                            return objectMapper.readTree((stringValue.getValue()));
                        } catch (IOException e) {
                            throw new CoercingParseLiteralException("Failed to parse JSON string", e);
                        }
                    }
                    throw new CoercingParseLiteralException("Expected JSON string literal");
                }
            })
            .build();

    @Bean
    public RuntimeWiringConfigurer jsonScalarRuntimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder.scalar(JSON_SCALAR);
    }
}
