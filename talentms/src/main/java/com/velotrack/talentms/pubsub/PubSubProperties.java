package com.velotrack.talentms.pubsub;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/** Topics de Pub/Sub cuyo suscriptor BigQuery escribe en las tablas del dataset velotrack. */
@ConfigurationProperties("velotrack.pubsub")
public record PubSubProperties(boolean enabled, String projectId, @DefaultValue Topics topics) {

    public record Topics(
            @DefaultValue("velotrack-categories") String categories,
            @DefaultValue("velotrack-venues") String venues,
            @DefaultValue("velotrack-teams") String teams,
            @DefaultValue("velotrack-skaters") String skaters,
            @DefaultValue("velotrack-coaches") String coaches,
            @DefaultValue("velotrack-coach-teams") String coachTeams,
            @DefaultValue("velotrack-access-audit-log") String accessAuditLog) {}
}
