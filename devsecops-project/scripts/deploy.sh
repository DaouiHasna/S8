#!/bin/bash
# Script de déploiement automatisé
# Usage: ./deploy.sh [environment] [version]

ENVIRONMENT=${1:-"staging"}
VERSION=${2:-"1.0.0"}
APP_NAME="todo-app"
IMAGE="registry.gitlab.com/cyber2026/$APP_NAME:$VERSION"

echo "Déploiement de $APP_NAME v$VERSION en $ENVIRONMENT..."

if [ "$ENVIRONMENT" == "staging" ]; then
    docker stop todo-staging 2>/dev/null || true
    docker rm todo-staging 2>/dev/null || true
    docker run -d \
        --name todo-staging \
        -p 8001:8000 \
        --restart unless-stopped \
        "$IMAGE"
    echo "✅ Déployé en staging sur le port 8001"

elif [ "$ENVIRONMENT" == "production" ]; then
    echo "Déploiement Kubernetes en production..."
    kubectl apply -f kubernetes/deployment.yaml
    kubectl apply -f kubernetes/service.yaml
    kubectl rollout status deployment/$APP_NAME -n production
    echo "✅ Déployé en production sur Kubernetes"
fi
