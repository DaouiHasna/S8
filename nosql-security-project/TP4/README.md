# TP4 - NoSQL Injection & Requêtes Sûres

## Module: Cybersécurité NoSQL - ENSA Fès

### Structure du TP4

```
iameeTP4/
├── README.md
├── docker-compose.yml
├── databasedump/
├── scripts/
├── code/                           # Code source
│   ├── server-vulnerable.js        # API avec vulnérabilités NoSQL
│   ├── server-safe.js              # API corrigée avec safeFilter
│   └── package.json                # Dépendances Node.js
└── report/
    └── nosql-tp4.pdf             # Rapport LaTeX complet```

### Phases du TP

1. **Environnement** : Docker MongoDB, base soc_lite, données de test
2. **API Vulnérable** : `find(req.body)` direct — injections possibles
3. **Attaques** : `$ne` bypass auth, `$regex` exfiltration données
4. **Sécurisation** : Pattern safeFilter, validation, projection
5. **Tests** : `$gt` bloqué, champs non prévus ignorés
6. **Fonction** : `hasNoMongoOperators()` en Node.js REPL
7. **Endpoint** : `/users/update-email` avec protection mass assignment

### Commandes rapides

```bash
# Démarrer MongoDB
docker start mongo-soc

# Démarrer serveur vulnérable
node code/server-vulnerable.js

# Démarrer serveur sécurisé
node code/server-safe.js

# Installer dépendances
npm install
```

### Auteur
TP réalisé dans le cadre du module Cybersécurité NoSQL - ENSA Fès


## Database Dump

The `database-dump/` folder contains:
- **JSON exports** of your collections (users, security_logs)
- **restore.js** - Script mongosh pour recréer la base
- **README.md** - Guide complet d'export/import

### Quick Restore
```bash
# Via mongosh
docker exec -i mongo-soc mongosh -u admin -p secret --authenticationDatabase admin < database-dump/restore.js

# Via mongorestore (archive)
docker exec -i mongo-soc sh -c 'mongorestore --authenticationDatabase admin -u admin -p secret --db soc_lite --archive' < database-dump/soc_lite.archive
```

### Scripts PowerShell
- `scripts/export-database.ps1` - Export automatique
- `scripts/restore-database.ps1` - Restauration automatique

## Docker Compose

```bash
cd TP4
docker-compose up -d
```

Lance MongoDB + API vulnérable (port 3000) + API sécurisée (port 3001)
