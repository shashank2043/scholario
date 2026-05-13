package com.scholario.notification.resolver;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.service.NotificationService;
import com.scholario.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationQueryResolver {

    private final NotificationService notificationService;
    private final UserService userService;

    @QueryMapping
    public List<NotificationResponse> getMyNotifications() {
        return notificationService.getNotificationsByUser(userService.getCurrentUserId());
    }

    @QueryMapping
    public List<NotificationResponse> getUnreadNotifications() {
        return notificationService.getUnreadNotifications(userService.getCurrentUserId());
    }

    @QueryMapping
    public Long getUnreadNotificationCount() {
        return notificationService.getUnreadCount(userService.getCurrentUserId());
    }
}