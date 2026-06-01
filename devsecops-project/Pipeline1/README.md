# Pipeline 1 - Build, Test, Security, Package, Deploy

## Description
Premier pipeline CI/CD complet pour une application Node.js (Todo App).

## Stages
1. **Build** : Installation des dépendances npm, vérification syntaxe JS
2. **Test** : Exécution des tests unitaires avec Jest
3. **Security** : Scan des secrets (Gitleaks) + scan des dépendances (npm audit)
4. **Package** : Build et push de l'image Docker vers GitLab Container Registry
5. **Deploy** : Déploiement en environnement staging

## Outils DevSecOps utilisés
- **Gitleaks** : Détection de secrets dans le code source
- **npm audit** : Analyse des vulnérabilités des dépendances Node.js
- **Docker** : Containerisation de l'application
- **GitLab CI/CD** : Orchestration du pipeline

## Résultat
✅ Pipeline passé avec succès (cf. screenshot)
