# Docker — Images et configurations

Ce dossier contient les fichiers Docker utilisés dans les différents TPs.

## Images utilisées

| Image | Tag | Utilisation |
|-------|-----|-------------|
| `mongo` | `7` | TP1, TP2, TP3, TP4 |

## Configurations par TP

| TP | Conteneur | Port | Mode |
|----|-----------|------|------|
| TP1 | `mongo-noseclab` | 27017 | Sans auth (lab) |
| TP2 | `mongo-noseclab` | 27017 | Sans auth (lab) |
| TP3 | `mongo_insecure` | 27018 | Sans auth (démo vulnérabilité) |
| TP3 | `mongo_secure1` | 27017 | Avec `--auth` (RBAC) |
| TP3 | `mongo_manual` | 27018 | Avec `--auth` (configuration manuelle) |
| TP4 | `mongo_secure1` | 27017 | Avec `--auth` (base pour API) |
| TP4 | `soc-api-vulnerable` | 3000 | API Express vulnérable (Node.js) |
| TP4 | `soc-api-secure` | 3001 | API Express sécurisée (Node.js) |

## Commandes rapides

```bash
# Lancer l'environnement complet (depuis la racine du projet)
docker-compose up -d

# TP1/TP2 — Accéder à MongoDB noseclab
docker exec -it mongo-noseclab mongosh

# TP3 — Accéder au MongoDB insécurisé (sans auth)
docker exec -it mongo_insecure mongosh

# TP3/TP4 — Accéder au MongoDB sécurisé (en tant qu'admin)
docker exec -it mongo_secure1 mongosh \
  "mongodb://adminSoc:Passw0rd_S3cure!@localhost:27017/?authSource=admin"

# TP3 — Accéder en tant qu'analyste (read-only)
docker exec -it mongo_secure1 mongosh \
  "mongodb://soc_analyst_ro:AnalystR0%402026!@localhost:27017/soc_lite?authSource=soc_lite"

# TP3 — Accéder en tant que manager (gestion incidents)
docker exec -it mongo_secure1 mongosh \
  "mongodb://soc_manager:Mgr$ecure2026!@localhost:27017/soc_lite?authSource=soc_lite"

# TP3 — Accéder en tant qu'application (readWrite)
docker exec -it mongo_secure1 mongosh \
  "mongodb://soc_app:AppP@ss2026!@localhost:27017/soc_lite?authSource=soc_lite"

# TP4 — Tester l'API vulnérable
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"motdepasse123"}'

# TP4 — Tester l'API sécurisée
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"motdepasse123"}'

# TP4 — Tenter une injection NoSQL sur l'API vulnérable
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":{"$ne":""}}'

# TP4 — Tenter une injection NoSQL sur l'API sécurisée (doit échouer)
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":{"$ne":""}}'