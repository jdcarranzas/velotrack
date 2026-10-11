package com.velotrack.talentms.pubsub;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.core.ApiFutureCallback;
import com.google.api.core.ApiFutures;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Publica en Pub/Sub sin bloquear la peticion. Un fallo solo se registra: el dato ya quedo
 * confirmado en Postgres y la entrega a BigQuery es de mejor esfuerzo (at-most-once).
 */
@Slf4j
public class GcpEventPublisher implements EventPublisher {
    private static final long SHUTDOWN_TIMEOUT_SECONDS = 10;

    private final String projectId;
    private final ObjectMapper objectMapper;
    private final Map<String, Publisher> publishersByTopic = new ConcurrentHashMap<>();

    public GcpEventPublisher(String projectId, ObjectMapper objectMapper) {
        this.projectId = projectId;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publish(String topic, Map<String, Object> payload) {
        try {
            PubsubMessage message = PubsubMessage.newBuilder()
                    .setData(ByteString.copyFromUtf8(objectMapper.writeValueAsString(payload))).build();
            ApiFutures.addCallback(publisherFor(topic).publish(message), new ApiFutureCallback<String>() {
                @Override
                public void onFailure(Throwable failure) {
                    log.warn("event=pubsub_publish_failed topic={} error={}", topic, failure.toString());
                }

                @Override
                public void onSuccess(String messageId) {
                    log.debug("event=pubsub_published topic={} messageId={}", topic, messageId);
                }
            }, MoreExecutors.directExecutor());
        } catch (JsonProcessingException | RuntimeException failure) {
            log.warn("event=pubsub_publish_failed topic={} error={}", topic, failure.toString());
        }
    }

    private Publisher publisherFor(String topic) {
        return publishersByTopic.computeIfAbsent(topic, topicId -> {
            try {
                return Publisher.newBuilder(TopicName.of(projectId, topicId)).build();
            } catch (IOException failure) {
                throw new IllegalStateException("No se pudo crear el publisher de " + topicId, failure);
            }
        });
    }

    @PreDestroy
    void shutdown() {
        publishersByTopic.values().forEach(publisher -> {
            try {
                publisher.shutdown();
                publisher.awaitTermination(SHUTDOWN_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
