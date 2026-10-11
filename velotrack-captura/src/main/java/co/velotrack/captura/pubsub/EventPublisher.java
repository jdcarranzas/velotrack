package co.velotrack.captura.pubsub;

import java.util.Map;

public interface EventPublisher {

    /** Publica el payload como JSON; las claves son los nombres de columna de la tabla BigQuery destino. */
    void publish(String topic, Map<String, Object> payload);
}
