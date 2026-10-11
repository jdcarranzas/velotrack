package co.velotrack.captura.pubsub;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Topics de Pub/Sub cuyo suscriptor BigQuery escribe en las tablas del dataset velotrack. */
@ConfigurationProperties("velotrack.pubsub")
public record PubSubProperties(boolean enabled, String projectId, @DefaultValue Topics topics) {

    public record Topics(
            @DefaultValue("velotrack-training-session") String trainingSession,
            @DefaultValue("velotrack-session-metrics") String sessionMetrics) {}
}
