package com.scholario.notification.resolver;

import com.scholario.notification.service.NotificationService;
import com.scholario.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationMutationResolverTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private NotificationMutationResolver notificationMutationResolver;

    @Test
    void markNotificationAsRead_ShouldDelegateToService() {
        notificationMutationResolver.markNotificationAsRead(1L);
        verify(notificationService).markAsRead(1L);
    }

    @Test
    void markAllNotificationsAsRead_ShouldDelegateToService() {
        when(userService.getCurrentUserId()).thenReturn(100L);
        Boolean result = notificationMutationResolver.markAllNotificationsAsRead();
        assertTrue(result);
        verify(notificationService).markAllAsRead(100L);
    }
}
