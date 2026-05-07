package com.scholario.notification.resolver;

import com.scholario.notification.model.Notification;
import com.scholario.notification.model.NotificationType;
import com.scholario.notification.service.NotificationPublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.reactivestreams.Publisher;
import reactor.core.publisher.Flux;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationSubscriptionResolverTest {

    @Mock
    private NotificationPublisher notificationPublisher;

    @InjectMocks
    private NotificationSubscriptionResolver notificationSubscriptionResolver;

    @Test
    void bookPublished_ShouldReturnPublisherFromService() {
        when(notificationPublisher.getSubscription(NotificationType.BOOK_PUBLISHED)).thenReturn(Flux.empty());
        
        Publisher<Notification> result = notificationSubscriptionResolver.bookPublished();
        
        assertNotNull(result);
        verify(notificationPublisher).getSubscription(NotificationType.BOOK_PUBLISHED);
    }

    @Test
    void notificationsByType_ShouldReturnPublisherFromService() {
        when(notificationPublisher.getSubscription(NotificationType.BOOK_ISSUED)).thenReturn(Flux.empty());

        Publisher<Notification> result = notificationSubscriptionResolver.notificationsByType("BOOK_ISSUED");

        assertNotNull(result);
        verify(notificationPublisher).getSubscription(NotificationType.BOOK_ISSUED);
    }

    @Test
    void notificationsByType_ShouldFallback_WhenTypeIsInvalid() {
        when(notificationPublisher.getSubscription(NotificationType.BOOK_PUBLISHED)).thenReturn(Flux.empty());

        Publisher<Notification> result = notificationSubscriptionResolver.notificationsByType("INVALID_TYPE");

        assertNotNull(result);
        verify(notificationPublisher).getSubscription(NotificationType.BOOK_PUBLISHED);
    }
}
