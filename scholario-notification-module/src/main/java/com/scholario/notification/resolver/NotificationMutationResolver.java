package com.scholario.notification.resolver;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.service.NotificationService;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationMutationResolver {

    private final NotificationService notificationService;
    private final UserService userService;

    @MutationMapping
    public NotificationResponse markNotificationAsRead(@Argument Long id) {
        return notificationService.markAsRead(id);
    }

    @MutationMapping
    public Boolean markAllNotificationsAsRead() {
        notificationService.markAllAsRead(userService.getCurrentUserId());
        return true;
    }
}