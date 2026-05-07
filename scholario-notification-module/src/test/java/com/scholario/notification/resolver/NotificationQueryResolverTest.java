package com.scholario.notification.resolver;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationQueryResolverTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationQueryResolver notificationQueryResolver;

    @Test
    void getNotificationsByUser_ShouldDelegateToService() {
        NotificationResponse response = new NotificationResponse(1L, "TYPE", "MSG", 100L, 200L, false, "NOW");
        when(notificationService.getNotificationsByUser(100L)).thenReturn(List.of(response));

        List<NotificationResponse> results = notificationQueryResolver.getNotificationsByUser(100L);

        assertEquals(1, results.size());
        verify(notificationService).getNotificationsByUser(100L);
    }

    @Test
    void getUnreadNotifications_ShouldDelegateToService() {
        notificationQueryResolver.getUnreadNotifications(100L);
        verify(notificationService).getUnreadNotifications(100L);
    }

    @Test
    void getUnreadNotificationCount_ShouldDelegateToService() {
        notificationQueryResolver.getUnreadNotificationCount(100L);
        verify(notificationService).getUnreadCount(100L);
    }
}
