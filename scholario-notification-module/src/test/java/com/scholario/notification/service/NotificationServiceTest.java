package com.scholario.notification.service;

import com.scholario.notification.dto.NotificationResponse;
import com.scholario.notification.model.Notification;
import com.scholario.notification.model.NotificationType;
import com.scholario.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = new Notification();
        notification.setId(1L);
        notification.setType(NotificationType.BOOK_PUBLISHED);
        notification.setMessage("A new book has been published");
        notification.setUserId(100L);
        notification.setRelatedEntityId(200L);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void createNotification_ShouldSaveAndReturnNotification() {
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.createNotification(
                NotificationType.BOOK_PUBLISHED, "Message", 100L, 200L);

        assertNotNull(result);
        assertEquals(NotificationType.BOOK_PUBLISHED, result.getType());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getNotificationsByUser_ShouldReturnResponses() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(100L))
                .thenReturn(List.of(notification));

        List<NotificationResponse> results = notificationService.getNotificationsByUser(100L);

        assertFalse(results.isEmpty());
        assertEquals(1L, results.get(0).id());
        assertEquals("BOOK_PUBLISHED", results.get(0).type());
    }

    @Test
    void getUnreadCount_ShouldReturnCount() {
        when(notificationRepository.countUnreadByUserId(100L)).thenReturn(5L);

        long count = notificationService.getUnreadCount(100L);

        assertEquals(5L, count);
    }

    @Test
    void markAsRead_ShouldUpdateAndReturnResponse() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponse result = notificationService.markAsRead(1L);

        assertTrue(notification.isRead());
        assertNotNull(result);
        verify(notificationRepository).save(notification);
    }

    @Test
    void markAsRead_ShouldThrowException_WhenNotFound() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> notificationService.markAsRead(1L));
    }

    @Test
    void markAllAsRead_ShouldUpdateAllUnread() {
        Notification n1 = new Notification();
        n1.setRead(false);
        Notification n2 = new Notification();
        n2.setRead(false);

        when(notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(100L))
                .thenReturn(List.of(n1, n2));

        notificationService.markAllAsRead(100L);

        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository).saveAll(anyList());
    }
}
