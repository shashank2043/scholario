package com.scholario.review.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Pending.class, name = "Pending"),
    @JsonSubTypes.Type(value = Approved.class, name = "Approved"),
    @JsonSubTypes.Type(value = Rejected.class, name = "Rejected"),
    @JsonSubTypes.Type(value = ChangesRequested.class, name = "ChangesRequested")
})
public sealed interface ReviewStatus permits Pending, Approved, Rejected, ChangesRequested {
    String name();
}
