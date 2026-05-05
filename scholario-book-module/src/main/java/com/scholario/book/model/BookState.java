package com.scholario.book.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Draft.class, name = "Draft"),
    @JsonSubTypes.Type(value = Review.class, name = "Review"),
    @JsonSubTypes.Type(value = Published.class, name = "Published"),
    @JsonSubTypes.Type(value = Archived.class, name = "Archived")
})
public sealed interface BookState permits Draft, Review, Published, Archived {

    String name();

    default boolean canTransitionTo(BookState newState) {
        return switch (this) {
            case Draft d -> newState instanceof Review || newState instanceof Archived;
            case Review r -> newState instanceof Published || newState instanceof Draft || newState instanceof Archived;
            case Published p -> newState instanceof Archived;
            case Archived a -> false;
        };
    }
}