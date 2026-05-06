package com.scholario.notification.resolver;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.service.NotificationService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class NotificationQueryResolver {

    private final NotificationService notificationService;

    public NotificationQueryResolver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @QueryMapping
    public List<NotificationResponse> getNotificationsByUser(@Argument Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @QueryMapping
    public List<NotificationResponse> getUnreadNotifications(@Argument Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    @QueryMapping
    public Long getUnreadNotificationCount(@Argument Long userId) {
        return notificationService.getUnreadCount(userId);
    }
}