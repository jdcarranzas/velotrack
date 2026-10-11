package co.velotrack.captura.pubsub;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Se usa con velotrack.pubsub.enabled=false (local y tests): no requiere credenciales GCP. */
public class NoopEventPublisher implements EventPublisher {
    private static final Logger LOG = LoggerFactory.getLogger(NoopEventPublisher.class);

    @Override
    public void publish(String topic, Map<String, Object> payload) {
        LOG.debug("event=pubsub_skipped topic={}", topic);
    }
}
