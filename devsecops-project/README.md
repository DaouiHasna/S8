# 🔐 DevSecOps Project — Hasna Daoui

> Module DevSecOps · GitLab CI/CD · 3 Pipelines · SAST · Docker · Kubernetes · Terraform

[![Pipeline 1](https://img.shields.io/badge/Pipeline%201-PASSED-brightgreen)](./Pipeline1/)
[![Pipeline 2](https://img.shields.io/badge/Pipeline%202-PASSED-brightgreen)](./Pipeline2/)
[![Pipeline 3](https://img.shields.io/badge/Pipeline%203-PASSED-brightgreen)](./pipline3/)
[![SonarQube](https://img.shields.io/badge/SAST-SonarQube-blue)](./pipline3/)
[![Docker](https://img.shields.io/badge/Docker-3%20images-blue)](https://www.docker.com/)

---

## 📋 Vue d'Ensemble

Ce dépôt regroupe l'ensemble des travaux pratiques du module **DevSecOps**, organisés en **3 pipelines CI/CD** progressifs sur GitLab. Chaque pipeline implémente des aspects différents de la chaîne DevSecOps moderne.

| Pipeline | Application | Stages | Sécurité | Déploiement |
|----------|-------------|--------|----------|-------------|
| [Pipeline 1](./Pipeline1/) | Todo App (Node.js) | Build · Test · Security · Package · Deploy | Gitleaks · npm audit | Docker Staging |
| [Pipeline 2](./Pipeline2/) | MongoDB CRUD App | Build · Push · Deploy-K8s | Docker scan | Kubernetes + AWS EC2 |
| [Pipeline 3](./pipline3/) | SecNotes (vulnérable) | Install · Test · SAST · Build · ZAP · Terraform | SonarQube · OWASP ZAP | Kubernetes |

---

## 📁 Structure du Dépôt

```
devsecops-project/
│
├── 📄 README.md                          ← Ce fichier
│
├── 🔵 Pipeline1/                         ← CI/CD Complet : Todo App
│   ├── README.md                         ← Documentation Pipeline 1
│   └── todo-app-main/
│       ├── .gitlab-ci.yml               ← Pipeline GitLab (5 stages)
│       ├── Dockerfile                   ← node:18-alpine, port 8000
│       ├── server.js                    ← Application Express
│       ├── package.json
│       ├── tests/app.test.js            ← Tests Jest
│       └── public/index.html
│
├── 🟢 Pipeline2/                         ← Docker + Kubernetes + Terraform
│   ├── Pipeline2_Report.pdf             ← Rapport Pipeline 2
│   └── mongodbusersapp-main/
│       ├── .gitlab-ci.yml               ← Pipeline GitLab (3 stages)
│       ├── mongo-crud-app/
│       │   ├── Dockerfile               ← node:18-alpine, port 3000
│       │   ├── docker-compose.yml       ← App + MongoDB (dev local)
│       │   ├── server.js
│       │   └── package.json
│       └── k8s-terraform/
│           ├── Dockerfile
│           ├── deploy.yaml              ← K8s Deployment (app + mongo)
│           ├── service.yaml             ← K8s Service (NodePort)
│           ├── main.tf                  ← Terraform (K8s namespace + secrets)
│           ├── variables.tf
│           ├── terraform.tfvars
│           └── outputs.tf
│
├── 🔴 pipline3/                          ← SAST SonarQube : SecNotes
│   ├── Pipeline3_SAST_Report.pdf        ← Rapport Pipeline 3
│   └── secnotes-devsecops-main/
│       ├── .gitlab-ci.yml               ← Pipeline GitLab (7 stages)
│       ├── Dockerfile                   ← node:20, port 3000
│       ├── sonar-project.properties     ← Config SonarQube
│       ├── package.json
│       ├── src/
│       │   ├── app.js
│       │   ├── config/db.js
│       │   ├── controllers/
│       │   │   ├── authController.js    ← V1, V3, V6, V8
│       │   │   └── noteController.js    ← V1, V4, V8
│       │   ├── middleware/auth.js       ← V2, V8
│       │   ├── models/
│       │   └── routes/
│       ├── tests/
│       │   ├── auth.test.js
│       │   └── notes.test.js
│       ├── k8s/                         ← Manifests Kubernetes
│       │   ├── namespace.yaml
│       │   ├── configmap.yaml
│       │   ├── secret.yaml
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── terraform/                   ← IaC Terraform
│           ├── main.tf
│           ├── provider.tf
│           ├── variables.tf
│           └── outputs.tf
│
├── 📸 screenshots/                       ← Captures d'écran des pipelines
│   ├── pipeline1-passed.png             ← P1 : Pipeline PASSED
│   ├── pipline3-passed.png              ← P3 : Pipeline PASSED
│   └── pipeline2/                       ← P2 : 14 screenshots
│       ├── 01_pipeline_passed.png
│       ├── 03_pods_running.png
│       ├── 04_mongodb_connected.png
│       ├── 05_app_with_kubernetes.png
│       ├── 06_kub_app.jpeg
│       ├── 07_ec2_created.png
│       ├── 08_ssh_machine.jpeg
│       ├── 09_ssh_local_port_forward.jpeg
│       ├── 10_docker_network_appnet.jpeg
│       ├── 11_run_app_image_ec2.jpeg
│       ├── 12_run_mongo_ec2.jpeg
│       ├── 13_test_docker_local.png
│       └── 14_app_running_browser.png
│
├── 🛠️ scripts/                           ← Scripts d'automatisation
│   ├── deploy.sh                        ← Déploiement staging/production
│   └── security-scan.sh                 ← Suite complète de scans sécurité
│
└── 📚 docs/
    ├── Rapport_Final_DevSecOps.pdf      ← Rapport final complet (tous pipelines)
    └── rapport_final.pdf                ← Rapport initial
```

---

## 🔵 Pipeline 1 — Todo App : CI/CD Complet

**Application :** Node.js Todo App  
**Pipeline :** 5 stages · `.gitlab-ci.yml`

### Stages

```
build → test → security → package → deploy
```

| Stage | Job | Outil | Description |
|-------|-----|-------|-------------|
| build | build-job | Node.js 18 | `npm install` + vérification syntaxe JS |
| test | test-job | Jest | Tests unitaires |
| security | security-secrets-scan | **Gitleaks** | Détection de secrets dans le code |
| security | security-dependencies-scan | **npm audit** | Scan CVE dépendances (level=high) |
| package | package-docker | Docker DinD | Build + push GitLab Container Registry |
| deploy | deploy-staging | Docker | `docker run` en staging (port 8001) |

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

```bash
# Lancer localement
docker build -t todo-app:1.0.0 .
docker run -d --name todo-app -p 8000:8000 todo-app:1.0.0
```

**Résultat :** ✅ Pipeline PASSED — Aucun secret détecté par Gitleaks

---

## 🟢 Pipeline 2 — MongoDB CRUD : Docker + Kubernetes + Terraform

**Application :** Node.js + MongoDB CRUD App  
**Pipeline :** 3 stages · Déploiement K8s + EC2

### Stages

```
build → push → deploy-kubernetes (manuel)
```

| Stage | Job | Outil | Description |
|-------|-----|-------|-------------|
| build | build:docker | Docker DinD | Build + push image (tag SHA + latest) |
| push | push:registry | Docker | Re-tag branche (main) + push registry |
| deploy-kubernetes | deploy:kubernetes | kubectl (Windows shell) | Apply K8s manifests + rollout status |

### Docker Compose (Développement Local)

```bash
# Lancer l'app complète en local
cd Pipeline2/mongodbusersapp-main/mongo-crud-app
docker-compose up -d

# App accessible sur http://localhost:3000
# MongoDB sur localhost:27017
```

```yaml
# docker-compose.yml
services:
  mongodb:
    image: mongo:latest
    ports: ["27017:27017"]
    volumes: [mongodb_data:/data/db]
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [mongodb]
```

### Kubernetes

```bash
# Déploiement Kubernetes (namespace mongodb-app)
kubectl apply -f k8s-terraform/deploy.yaml -n mongodb-app
kubectl rollout status deployment/mongo-crud-app -n mongodb-app
kubectl get pods -n mongodb-app
kubectl get svc -n mongodb-app
```

### Terraform (AWS EC2)

```bash
cd Pipeline2/mongodbusersapp-main/k8s-terraform
terraform init
terraform plan
terraform apply

# Puis sur EC2 :
docker network create appnet
docker run -d --name mongo --network appnet mongo:latest
docker run -d --name app --network appnet -p 3000:3000 <image>

# SSH Port Forwarding pour accès local :
ssh -L 3000:localhost:3000 user@<ec2-ip>
```

**Résultat :** ✅ Pipeline PASSED — Pods K8s Running, App accessible navigateur

---

## 🔴 Pipeline 3 — SecNotes : SAST SonarQube

**Application :** SecNotes — Node.js + MongoDB (intentionnellement vulnérable)  
**Pipeline :** 7 stages · Pipeline #2437191969

### Stages

```
install → test → sast → build → deploy → zap → terraform
```

| Stage | Job | Outil | Description |
|-------|-----|-------|-------------|
| install | install | npm | Installation dépendances |
| test | test | Jest | Tests unitaires (mongodb-memory-server) |
| **sast** | **sonarqube_scan** | **SonarQube** | **Analyse statique sécurité** |
| build | build | Docker | Build image secnotes:$SHA |
| deploy | deploy | kubectl | Apply K8s manifests (namespace secnotes) |
| zap | zap_dast_scan | OWASP ZAP | Scan DAST dynamique |
| terraform | terraform | Terraform | `terraform init + plan` (manuel) |

### Vulnérabilités Détectées par SonarQube

| ID | Vulnérabilité | Sévérité | OWASP |
|----|---------------|----------|-------|
| V1 | Injection NoSQL | 🔴 CRITIQUE | A03:2021 |
| V2 | Secret JWT Hardcodé | 🔴 CRITIQUE | A02:2021 |
| V3 | Absence Validation Entrées | 🟠 HAUTE | A03/A04 |
| V4 | IDOR — Contrôle d'Accès | 🟠 HAUTE | A01:2021 |
| V6 | Hashage MD5 Faible | 🟠 HAUTE | A02:2021 |
| V8 | Logs Verbeux / Fuite Info | 🟡 MOYENNE | A09:2021 |
| V10 | CORS Trop Permissif | 🟡 MOYENNE | A05:2021 |

### Docker + Kubernetes

```bash
# Build local
docker build -t secnotes:latest .
docker run -d --name secnotes -p 3000:3000 secnotes:latest

# Déploiement Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml -n secnotes
kubectl apply -f k8s/secret.yaml -n secnotes
kubectl apply -f k8s/deployment.yaml -n secnotes
kubectl apply -f k8s/service.yaml -n secnotes
kubectl rollout status deployment/secnotes-app -n secnotes --timeout=90s
```

**Résultat :** ✅ Pipeline PASSED — 7 vulnérabilités détectées par SonarQube

---

## 🛠️ Scripts d'Automatisation

### deploy.sh

```bash
# Déploiement en staging
./scripts/deploy.sh staging 1.0.0

# Déploiement en production (Kubernetes)
./scripts/deploy.sh production 1.0.0
```

### security-scan.sh

```bash
# Lancer la suite complète de scans de sécurité
./scripts/security-scan.sh <image_name> <target_url>

# Exemple :
./scripts/security-scan.sh registry.gitlab.com/cyber2026/todo-app:1.0.0 http://localhost:8000
```

Outils exécutés : Gitleaks · npm audit · Trivy · Hadolint · Résumé JSON

---

## 🏗️ Technologies Utilisées

| Catégorie | Outils |
|-----------|--------|
| **CI/CD** | GitLab CI/CD, GitLab Runner (local + Docker) |
| **Containerisation** | Docker, Docker Compose, Docker DinD |
| **Orchestration** | Kubernetes (Docker Desktop), kubectl |
| **IaC** | Terraform (providers: Kubernetes, AWS) |
| **SAST** | SonarQube, Gitleaks, npm audit |
| **DAST** | OWASP ZAP (zap-baseline.py) |
| **Image scan** | Trivy, Hadolint |
| **Runtime** | Node.js 18/20, Express, MongoDB |
| **Tests** | Jest, Supertest, mongodb-memory-server |
| **Cloud** | AWS EC2 |

---

## 📸 Screenshots

Les captures d'écran de tous les pipelines sont disponibles dans le dossier [`screenshots/`](./screenshots/).

| Fichier | Description |
|---------|-------------|
| `pipeline1-passed.png` | Pipeline 1 — Statut PASSED |
| `pipeline2/01_pipeline_passed.png` | Pipeline 2 — Statut PASSED |
| `pipeline2/03_pods_running.png` | Pods K8s en état Running |
| `pipeline2/04_mongodb_connected.png` | Connexion MongoDB confirmée |
| `pipeline2/05_app_with_kubernetes.png` | App accessible via K8s |
| `pipeline2/07_ec2_created.png` | Instance EC2 créée |
| `pipeline2/11_run_app_image_ec2.jpeg` | App lancée sur EC2 |
| `pipeline2/14_app_running_browser.png` | App dans le navigateur |
| `pipline3-passed.png` | Pipeline 3 — Statut PASSED (SAST) |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/Rapport_Final_DevSecOps.pdf`](./docs/Rapport_Final_DevSecOps.pdf) | Rapport final complet (tous pipelines + images) |
| [`Pipeline2/Pipeline2_Report.pdf`](./Pipeline2/Pipeline2_Report.pdf) | Rapport détaillé Pipeline 2 |
| [`pipline3/Pipeline3_SAST_Report.pdf`](./pipline3/Pipeline3_SAST_Report.pdf) | Rapport SAST Pipeline 3 |
| [`Pipeline1/README.md`](./Pipeline1/README.md) | Documentation Pipeline 1 |

---

## 👤 Auteure

**Hasna Daoui**  
Module DevSecOps — Sécurité des Systèmes d'Information

---

*Tous les pipelines ont été exécutés avec succès sur GitLab CI/CD avec un runner local.*
