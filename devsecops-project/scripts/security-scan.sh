#!/bin/bash
# Script d'automatisation des scans de sécurité DevSecOps
# Usage: ./security-scan.sh [image_name] [target_url]

set -e

IMAGE_NAME=${1:-"registry.gitlab.com/cyber2026/todo-app:1.0.0"}
TARGET_URL=${2:-"http://localhost:8000"}
REPORT_DIR="./security-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "=============================================="
echo "  DevSecOps Security Scan Suite"
echo "  Timestamp: $TIMESTAMP"
echo "=============================================="

mkdir -p "$REPORT_DIR"

# 1. Gitleaks - Secrets scan
echo ""
echo "[1/5] Scan des secrets avec Gitleaks..."
if command -v gitleaks &> /dev/null; then
    gitleaks detect --source . --no-git \
        --report-path "$REPORT_DIR/gitleaks-$TIMESTAMP.json" \
        --verbose && echo "✅ Aucun secret détecté" || echo "⚠️  Secrets potentiels trouvés!"
else
    echo "⚠️  Gitleaks non installé - skipped"
fi

# 2. npm audit - Dependencies
echo ""
echo "[2/5] Scan des dépendances npm..."
if [ -f "package.json" ]; then
    npm audit --audit-level=high --json > "$REPORT_DIR/npm-audit-$TIMESTAMP.json" && \
        echo "✅ Pas de vulnérabilités HIGH/CRITICAL" || \
        echo "⚠️  Vulnérabilités détectées (voir rapport)"
else
    echo "⚠️  package.json non trouvé - skipped"
fi

# 3. Trivy - Docker image scan
echo ""
echo "[3/5] Scan image Docker avec Trivy..."
if command -v trivy &> /dev/null; then
    trivy image --severity HIGH,CRITICAL \
        --format json \
        --output "$REPORT_DIR/trivy-$TIMESTAMP.json" \
        "$IMAGE_NAME" && echo "✅ Scan Trivy terminé"
else
    echo "⚠️  Trivy non installé - skipped"
fi

# 4. Hadolint - Dockerfile check
echo ""
echo "[4/5] Vérification Dockerfile avec Hadolint..."
if command -v hadolint &> /dev/null && [ -f "Dockerfile" ]; then
    hadolint Dockerfile --format json > "$REPORT_DIR/hadolint-$TIMESTAMP.json" && \
        echo "✅ Dockerfile conforme" || echo "⚠️  Problèmes détectés dans Dockerfile"
else
    echo "⚠️  Hadolint non installé ou Dockerfile absent - skipped"
fi

# 5. Summary
echo ""
echo "[5/5] Génération du résumé..."
python3 -c "
import json, os, glob, datetime

report_dir = '$REPORT_DIR'
timestamp = '$TIMESTAMP'
reports = glob.glob(f'{report_dir}/*{timestamp}*')

summary = {
    'scan_date': str(datetime.datetime.now()),
    'image': '$IMAGE_NAME',
    'target': '$TARGET_URL',
    'reports_generated': [os.path.basename(r) for r in reports],
    'status': 'completed'
}

with open(f'{report_dir}/summary-{timestamp}.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(json.dumps(summary, indent=2))
" 2>/dev/null || echo "Summary généré dans $REPORT_DIR"

echo ""
echo "=============================================="
echo "  Scan terminé! Rapports dans: $REPORT_DIR"
echo "=============================================="
