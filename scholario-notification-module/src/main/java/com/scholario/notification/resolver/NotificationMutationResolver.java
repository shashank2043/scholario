package com.scholario.notification.resolver;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.service.NotificationService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationMutationResolver {

    private final NotificationService notificationService;

    public NotificationMutationResolver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @MutationMapping
    public NotificationResponse markNotificationAsRead(@Argument Long id) {
        return notificationService.markAsRead(id);
    }

    @MutationMapping
    public Boolean markAllNotificationsAsRead(@Argument Long userId) {
        notificationService.markAllAsRead(userId);
        return true;
    }
}