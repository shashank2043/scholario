package com.scholario.content.dto;

import lombok.Data;

@Data
public class DigitalContentInput {
    private Long bookId;
    private String contentType;
    private String contentUrl;
    private boolean drmEnforced;
}
