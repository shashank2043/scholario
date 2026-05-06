package com.scholario.royalty.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.language.StringValue;
import graphql.schema.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

import java.io.IOException;

@Configuration
public class GraphQLScalarConfig {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static final GraphQLScalarType JSON_SCALAR = GraphQLScalarType.newScalar()
            .name("JSON")
            .description("JSON scalar type for dynamic map/object values")
            .coercing(new Coercing<JsonNode, String>() {
                @Override
                public String serialize(Object dataFetcherResult) throws CoercingSerializeException {
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
                public JsonNode parseValue(Object input) throws CoercingParseValueException {
                    return parseLiteral(input);
                }

                @Override
                public JsonNode parseLiteral(Object input) throws CoercingParseLiteralException {
                    if (input instanceof StringValue) {
                        try {
                            return objectMapper.readTree(((StringValue) input).getValue());
                        } catch (IOException e) {
                            throw new CoercingParseLiteralException("Failed to parse JSON string", e);
                        }
                    }
                    // For input objects (maps), convert to JsonNode
                    if (input instanceof java.util.Map) {
                        return objectMapper.convertValue(input, JsonNode.class);
                    }
                    throw new CoercingParseLiteralException("Expected JSON string or object");
                }
            })
            .build();

    @Bean
    public RuntimeWiringConfigurer jsonScalarRuntimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder.scalar(JSON_SCALAR);
    }
}
