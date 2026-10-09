#!/usr/bin/env bash
# Build -> push to Artifact Registry -> deploy to Cloud Run.
# Usage:
#   deploy/gcp/deploy.sh --help
#   deploy/gcp/deploy.sh --project P --region us-central1 --repo talentms \
#     --service talentms --instance P:R:I [--tag v1] [--dry-run]
set -euo pipefail

PROJECT=""; REGION="us-central1"; REPO="talentms"; SERVICE="talentms"
INSTANCE=""; TAG="latest"; DRY_RUN="false"

usage() {
  cat <<'EOF'
Usage: deploy.sh --project PROJECT --instance PROJECT:REGION:INSTANCE [options]
  --project P     GCP project id (required)
  --region R      GCP region (default: us-central1)
  --repo NAME     Artifact Registry repo (default: talentms)
  --service NAME  Cloud Run service (default: talentms)
  --instance CONN Cloud SQL connection name PROJECT:REGION:INSTANCE (required)
  --tag TAG       Image tag (default: latest)
  --dry-run       Print commands without executing
  --help          Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="$2"; shift 2;;
    --region) REGION="$2"; shift 2;;
    --repo) REPO="$2"; shift 2;;
    --service) SERVICE="$2"; shift 2;;
    --instance) INSTANCE="$2"; shift 2;;
    --tag) TAG="$2"; shift 2;;
    --dry-run) DRY_RUN="true"; shift;;
    --help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1;;
  esac
done

if [[ -z "$PROJECT" || -z "$INSTANCE" ]]; then
  echo "ERROR: --project and --instance are required." >&2; usage; exit 1
fi

IMAGE="$REGION-docker.pkg.dev/$PROJECT/$REPO/$SERVICE:$TAG"
run() { if [[ "$DRY_RUN" == "true" ]]; then echo "[dry-run] $*"; else echo "+ $*"; "$@"; fi; }

run docker build -t "$IMAGE" talentms/
run docker push "$IMAGE"
# Stamp image into cloudrun.yaml to a temp file for idempotent replace
TMP="$(mktemp)"
sed "s#image: .*#image: $IMAGE#" deploy/gcp/cloudrun.yaml > "$TMP"
run gcloud run services replace "$TMP" --region="$REGION" --project="$PROJECT"
rm -f "$TMP"
echo "Deployed $SERVICE ($IMAGE) in $REGION"
