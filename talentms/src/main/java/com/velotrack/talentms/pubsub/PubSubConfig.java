package com.velotrack.talentms.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(PubSubProperties.class)
class PubSubConfig {

    @Bean
    EventPublisher eventPublisher(PubSubProperties properties, ObjectMapper objectMapper) {
        if (!properties.enabled()) {
            return new NoopEventPublisher();
        }
        if (properties.projectId() == null || properties.projectId().isBlank()) {
            throw new IllegalStateException("velotrack.pubsub.project-id es obligatorio con pubsub habilitado");
        }
        return new GcpEventPublisher(properties.projectId(), objectMapper);
    }
}
