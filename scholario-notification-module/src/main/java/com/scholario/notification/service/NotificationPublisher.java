package com.scholario.notification.service;

import com.scholario.notification.model.Notification;
import com.scholario.notification.model.NotificationType;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationPublisher {

    private final Map<NotificationType, Sinks.Many<Notification>> sinks = new ConcurrentHashMap<>();

    public NotificationPublisher() {
        for (NotificationType type : NotificationType.values()) {
            sinks.put(type, Sinks.many().replay().limit(100));
        }
    }

    public void publish(Notification notification) {
        Sinks.Many<Notification> sink = sinks.get(notification.getType());
        if (sink != null) {
            sink.tryEmitNext(notification);
        }
    }

    public Flux<Notification> getSubscription(NotificationType type) {
        if (type == null) {
            return Flux.empty();
        }
        Sinks.Many<Notification> sink = sinks.get(type);
        return sink != null ? sink.asFlux() : Flux.empty();
    }
}