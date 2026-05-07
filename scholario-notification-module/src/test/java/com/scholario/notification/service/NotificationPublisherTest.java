package com.scholario.notification.service;

import com.scholario.notification.model.Notification;
import com.scholario.notification.model.NotificationType;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

class NotificationPublisherTest {

    private final NotificationPublisher notificationPublisher = new NotificationPublisher();

    @Test
    void publish_ShouldEmitNotificationToSubscribers() {
        Notification notification = new Notification();
        notification.setType(NotificationType.BOOK_PUBLISHED);
        notification.setMessage("Test Message");

        Flux<Notification> subscription = notificationPublisher.getSubscription(NotificationType.BOOK_PUBLISHED);

        // We use StepVerifier to check the emission
        StepVerifier verifier = StepVerifier.create(subscription)
                .expectNext(notification)
                .thenCancel()
                .verifyLater();

        notificationPublisher.publish(notification);

        verifier.verify();
    }

    @Test
    void getSubscription_ShouldReturnEmptyFlux_WhenTypeIsNull() {
        Flux<Notification> subscription = notificationPublisher.getSubscription(null);
        
        StepVerifier.create(subscription)
                .expectComplete()
                .verify();
    }
}
