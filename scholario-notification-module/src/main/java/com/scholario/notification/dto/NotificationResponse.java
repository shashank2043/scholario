package com.scholario.notification.dto;

public record NotificationResponse(
        Long id,
        String type,
        String message,
        Long userId,
        Long relatedEntityId,
        boolean read,
        String createdAt
) {
    public static NotificationResponse fromEntity(com.scholario.notification.model.Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType().name(),
                notification.getMessage(),
                notification.getUserId(),
                notification.getRelatedEntityId(),
                notification.isRead(),
                notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null
        );
    }
}
