#!/usr/bin/env bash
# Crea topics Pub/Sub, suscripciones BigQuery e IAM para cargar velotrack en el dataset BigQuery 'velotrack'.
# Idempotente: se puede ejecutar varias veces. Requiere gcloud autenticado (Cloud Shell sirve).
#
# Uso: PROJECT_ID=project-1982eff9-e8d4-4e80-914 ./create-pubsub-bq.sh
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-project-1982eff9-e8d4-4e80-914}"
DATASET="${DATASET:-velotrack}"
RUN_SERVICE_ACCOUNT="${RUN_SERVICE_ACCOUNT:-talentms-run@${PROJECT_ID}.iam.gserviceaccount.com}"
RETENTION="${RETENTION:-7d}"
DEAD_LETTER_TOPIC="velotrack-dlq"
MAX_DELIVERY_ATTEMPTS=5

# topic:tabla_bigquery
TOPIC_TABLES=(
  "velotrack-training-session:training_session"
  "velotrack-session-metrics:session_metrics"
  "velotrack-categories:categories"
  "velotrack-venues:venues"
  "velotrack-teams:teams"
  "velotrack-skaters:skaters"
  "velotrack-coaches:coaches"
  "velotrack-coach-teams:coach_teams"
  "velotrack-access-audit-log:access_audit_log"
)

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
PUBSUB_AGENT="service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com"

echo "==> APIs"
gcloud services enable pubsub.googleapis.com bigquery.googleapis.com --project "$PROJECT_ID"

echo "==> Esquema BigQuery (columnas de versionado/dedup) y vistas *_current"
if command -v bq >/dev/null 2>&1; then
  bq query --project_id="$PROJECT_ID" --use_legacy_sql=false < "$(dirname "$0")/bigquery-dedup.sql" \
    || echo "bq fallo: ejecute bigquery-dedup.sql manualmente (jobs.query o consola BigQuery)" >&2
else
  echo "bq no disponible: ejecute bigquery-dedup.sql manualmente en la consola de BigQuery" >&2
fi

echo "==> Permisos del agente de Pub/Sub sobre el dataset"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PUBSUB_AGENT}" --role="roles/bigquery.dataEditor" \
  --condition=None --quiet >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PUBSUB_AGENT}" --role="roles/bigquery.metadataViewer" \
  --condition=None --quiet >/dev/null

echo "==> Dead letter: ${DEAD_LETTER_TOPIC}"
gcloud pubsub topics describe "$DEAD_LETTER_TOPIC" --project "$PROJECT_ID" >/dev/null 2>&1 \
  || gcloud pubsub topics create "$DEAD_LETTER_TOPIC" --project "$PROJECT_ID" \
       --message-retention-duration="$RETENTION"
gcloud pubsub subscriptions describe "${DEAD_LETTER_TOPIC}-sub" --project "$PROJECT_ID" >/dev/null 2>&1 \
  || gcloud pubsub subscriptions create "${DEAD_LETTER_TOPIC}-sub" --project "$PROJECT_ID" \
       --topic="$DEAD_LETTER_TOPIC" --message-retention-duration="$RETENTION"
gcloud pubsub topics add-iam-policy-binding "$DEAD_LETTER_TOPIC" --project "$PROJECT_ID" \
  --member="serviceAccount:${PUBSUB_AGENT}" --role="roles/pubsub.publisher" --quiet >/dev/null

for entry in "${TOPIC_TABLES[@]}"; do
  topic="${entry%%:*}"
  table="${entry##*:}"
  subscription="${topic}-bq"

  echo "==> ${topic} -> ${DATASET}.${table}"
  gcloud pubsub topics describe "$topic" --project "$PROJECT_ID" >/dev/null 2>&1 \
    || gcloud pubsub topics create "$topic" --project "$PROJECT_ID" --message-retention-duration="$RETENTION"

  if ! gcloud pubsub subscriptions describe "$subscription" --project "$PROJECT_ID" >/dev/null 2>&1; then
    gcloud pubsub subscriptions create "$subscription" --project "$PROJECT_ID" --topic="$topic" \
      --bigquery-table="${PROJECT_ID}:${DATASET}.${table}" \
      --use-table-schema --drop-unknown-fields \
      --dead-letter-topic="$DEAD_LETTER_TOPIC" --max-delivery-attempts="$MAX_DELIVERY_ATTEMPTS"
  fi
  gcloud pubsub subscriptions add-iam-policy-binding "$subscription" --project "$PROJECT_ID" \
    --member="serviceAccount:${PUBSUB_AGENT}" --role="roles/pubsub.subscriber" --quiet >/dev/null

  gcloud pubsub topics add-iam-policy-binding "$topic" --project "$PROJECT_ID" \
    --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" --role="roles/pubsub.publisher" --quiet >/dev/null
done

echo "Listo. Topics:"
gcloud pubsub topics list --project "$PROJECT_ID" --format='value(name)' | grep velotrack
