# velotrack-gateway

Gateway Spring Cloud (WebFlux) que solo enruta. Sin autenticación ni autorización propia; el header `Authorization` pasa intacto (captura exige HTTP Basic).

## Puertos locales

| Servicio | Puerto |
|---|---|
| gateway | 8080 |
| talentms | 8081 |
| velotrack-captura | 8082 (docker compose publica 127.0.0.1:8082) |

## Rutas

| Path | Destino (env, default) |
|---|---|
| `/api/venues/**`, `/api/teams/**`, `/api/categories/**`, `/api/skaters/**`, `/api/coaches/**` | `TALENTMS_URL` = `http://localhost:8081` |
| `/talentms/actuator/health/**` (StripPrefix=1 → `/actuator/health/**` de talentms) | `TALENTMS_URL` |
| `/captura/actuator/health/**` (StripPrefix=1 → `/actuator/health/**` de captura) | `CAPTURA_URL` |
| `/api/v1/**` (sessions, athletes/{id}/sessions, agenda) | `CAPTURA_URL` = `http://localhost:8082` |

## Ejecutar

```
mvn spring-boot:run
curl http://localhost:8080/actuator/gateway/routes
```

## Despliegue en GCP (Cloud Build → Cloud Run)

`cloudbuild.yaml` construye la imagen, la sube a Artifact Registry y despliega en Cloud Run.
`TALENTMS_URL` y `CAPTURA_URL` se montan desde Secret Manager (`talentms-url`, `captura-url`).

Preparación única (reemplazar `TALENTMS_HOST` y `CAPTURA_HOST` por las URLs reales):

```
gcloud config set project project-1982eff9-e8d4-4e80-914
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

gcloud artifacts repositories create velotrack --repository-format=docker --location=us-east1

printf '%s' 'https://TALENTMS_HOST' | gcloud secrets create talentms-url --data-file=-
printf '%s' 'https://CAPTURA_HOST'  | gcloud secrets create captura-url  --data-file=-

PROJECT_NUMBER=$(gcloud projects describe project-1982eff9-e8d4-4e80-914 --format='value(projectNumber)')
# Cloud Build: push de imagen y deploy a Cloud Run
for ROLE in roles/artifactregistry.writer roles/run.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding project-1982eff9-e8d4-4e80-914 \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="$ROLE"
done
# Cloud Run (SA de cómputo por defecto): leer los secrets
for SECRET in talentms-url captura-url; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role=roles/secretmanager.secretAccessor
done
```

Desplegar:

```
gcloud builds submit --config cloudbuild.yaml --substitutions=_REGION=us-east1 .
```

Nota: el servicio queda con `--allow-unauthenticated`. El gateway no tiene auth y talentms tampoco, así que sus endpoints quedarán públicos. Quitar el flag y usar IAM/IAP si no se desea.
