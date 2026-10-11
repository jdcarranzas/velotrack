package com.velotrack.talentms.pubsub;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/** Se usa con velotrack.pubsub.enabled=false (local y tests): no requiere credenciales GCP. */
@Slf4j
public class NoopEventPublisher implements EventPublisher {

    @Override
    public void publish(String topic, Map<String, Object> payload) {
        log.debug("event=pubsub_skipped topic={}", topic);
    }
}
