# NoSQL Security Project — Module NoSQL S8

Dépôt regroupant l'ensemble des travaux pratiques du module **Sécurité NoSQL** réalisés durant le semestre S8.

---

## Structure du projet

```
nosql-security-project/
├── TP1/                        # Introduction MongoDB & noseclab
│   ├── docs/
│   │   └── rapport_TP1.pdf
│   ├── data/
│   │   └── noseclab_backup/    # Export BSON de la base
│   └── README.md
├── TP2/                        # Modélisation SOC & Requêtes Avancées
│   ├── docs/
│   │   └── rapport_TP2.pdf
│   ├── data/
│   │   └── mongo-backup/       # Export BSON soc_lite
│   └── README.md
├── TP3/                        # Authentification & RBAC
│   ├── docs/
│   │   └── rapport_TP3.pdf
│   ├── commands.txt            # Toutes les commandes exécutées
│   └── README.md
├── TP4/                        # NoSQL Injection & Requêtes Sûres
│   ├── code/                   # Code source
│   │   ├── server-vulnerable.js    # API avec vulnérabilités NoSQL
│   │   ├── server-safe.js          # API corrigée avec safeFilter
│   │   └── package.json            # Dépendances Node.js
│   ├── docs/
│   │   └── rapport_TP4.pdf     # Rapport TP4
│   ├── database-dump/
│   └── README.md
├── docker/
│   └── README.md               # Guide Docker
├── docs/
│   └── rapport_final.pdf       # Rapport global du semestre
├── docker-compose.yml          # Tous les environnements (TP1–TP4)
├── screenshots/
│   ├── TP1/
│   ├── TP2/
│   ├── TP3/
│   └── TP4/
├── requirements.txt            # Dépendances Python/Node
└── README.md                   # Fichier principal                 
```

---

## TPs réalisés

| TP | Thème | Technologies | Statut |
|----|-------|-------------|--------|
| TP1 | Introduction MongoDB, noseclab | MongoDB 7, Docker, mongosh | ✅ Terminé |
| TP2 | Modélisation SOC, requêtes avancées & index | MongoDB 7, Docker, mongosh | ✅ Terminé |
| TP3 | Authentification & RBAC MongoDB | MongoDB 7 `--auth`, Docker | ✅ Terminé |
| TP4 | NoSQL Injection & Requêtes Sûres | Node.js, Express, MongoDB, Docker | ✅ Terminé |


---

## Démarrage rapide

### Prérequis

- Docker ≥ 20.x
- Docker Compose ≥ 2.x
- Git
- Node.js ≥ 18.x (pour TP4)

### Lancer l'environnement complet

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd nosql-security-project

# Lancer tous les conteneurs (TP1–TP4)
docker-compose up -d

# Vérifier que les conteneurs tournent
docker ps
```

### Accès aux bases de données

```bash
# TP1/TP2 — noseclab / soc_lite
docker exec -it mongo-noseclab mongosh

# TP3 — MongoDB sécurisé
docker exec -it mongo_secure1 mongosh \
  "mongodb://admin:AdminSecure2026!@localhost:27017/?authSource=admin"

# TP3 — MongoDB vulnérable (sans auth)
docker exec -it mongo_insecure mongosh
```

### Accès aux APIs TP4

```bash
# API vulnérable (port 3000)
curl -s http://localhost:3000

# API sécurisée (port 3001)
curl -s http://localhost:3001

# Test login légitime sur API sécurisée
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"motdepasse123"}'

# Test injection $ne sur API sécurisée (doit échouer)
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":{"$ne":""}}'
```

### Restaurer les données

```bash
# TP1
docker cp TP1/data/noseclab_backup/ mongo-noseclab:/backup
docker exec mongo-noseclab mongorestore --db noseclab /backup/

# TP2
docker cp TP2/data/mongo-backup/ mongo-noseclab:/backup
docker exec mongo-noseclab mongorestore --db soc_lite /backup/soc_lite/

# TP4 — Peupler la collection users dans mongosh
use soc_lite
db.users.insertMany([
  { username: "alice", password: "motdepasse123", role: "analyst" },
  { username: "bob",   password: "secret456",     role: "admin" },
  { username: "carol", password: "carol789",       role: "viewer" }
])
```

---

## Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| MongoDB | 7.0.31 | Base de données NoSQL principale |
| mongosh | 2.8.1 | Shell interactif MongoDB |
| Docker | ≥ 20.x | Conteneurisation des environnements |
| Docker Compose | ≥ 2.x | Orchestration multi-conteneurs |
| Node.js | 18.x | Environnement d'exécution API (TP4) |
| Express | 4.18.x | Framework web API (TP4) |
| MongoDB Driver | 6.3.x | Driver Node.js pour MongoDB (TP4) |

---

## Concepts de sécurité abordés

- **TP1** : Découverte de MongoDB, exploration de données de sécurité (logs)
- **TP2** : Modélisation d'une base SOC, gestion des incidents, index de performance
- **TP3** : Authentification MongoDB (`--auth`), RBAC, rôles personnalisés, validation des droits, isolation réseau
- **TP4** : Sécurité applicative — injection NoSQL (`$ne`, `$regex`, `$gt`), pattern *safeFilter*, validation de type, allow-list, projection minimale, Mass Assignment, défense en profondeur

---

## Architecture des environnements

| Conteneur | Image | Port | Mode | TP |
|:---|:---|:---|:---|:---|
| mongo-noseclab | mongo:7 | 27017 | Sans auth | TP1, TP2 |
| mongo_insecure | mongo:7 | 27018 | Sans auth (vulnérable) | TP3 |
| mongo_secure1 | mongo:7 | 27019 | Avec `--auth` (RBAC) | TP3, TP4 |
| soc-api-vulnerable | node:18 | 3000 | API Express vulnérable | TP4 |
| soc-api-secure | node:18 | 3001 | API Express sécurisée | TP4 |

---

## Rapport final

Le rapport global du semestre (TP1–TP4) est disponible dans [`docs/rapport_final.pdf`](docs/rapport_final.pdf).

---

## Auteur

Module NoSQL Security — Semestre S8  
Année universitaire 2025–2026
