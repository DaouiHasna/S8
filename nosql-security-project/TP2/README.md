# TP2 — Modélisation NoSQL, Requêtes Avancées & Index

## Objectifs

- Modélisation d'une base SOC (Security Operations Center) : `soc_lite`
- Insertion de données multi-collections (users, logs, incidents, IDS alerts)
- Requêtes avancées d'analyse de sécurité
- Création et utilisation d'index pour optimiser les performances
- Export de la base de données (backup MongoDB)

## Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| Docker | ≥ 20.x | Conteneurisation |
| MongoDB | 7.0 | Base de données NoSQL |
| mongosh | 2.8.1 | Shell interactif MongoDB |

## Environnement

```bash
# Lancer le conteneur
docker run -d --name mongo-noseclab -p 27017:27017 mongo:7

# Accéder au shell
docker exec -it mongo-noseclab mongosh

# Base SOC
use soc_lite
```

## Modélisation de la base `soc_lite`

```
soc_lite/
├── users              # Utilisateurs du système SOC
│   ├── username
│   ├── role           # admin, analyst, viewer
│   ├── email
│   └── created_at
├── security_logs      # Logs d'événements bruts
│   ├── timestamp
│   ├── source_ip
│   ├── event_type
│   └── severity
├── incidents          # Incidents de sécurité ouverts
│   ├── title
│   ├── status         # open, in_progress, closed
│   ├── severity       # low, medium, high, critical
│   ├── assigned_to
│   └── created_at
└── ids_alerts         # Alertes IDS/IPS
    ├── alert_type
    ├── source_ip
    ├── destination_ip
    ├── protocol
    └── timestamp
```

## Principales commandes effectuées

```javascript
// === INSERTION ===

// Créer les utilisateurs
db.users.insertMany([
  { username: "admin", role: "admin", email: "admin@soc.local" },
  { username: "analyst1", role: "analyst", email: "analyst1@soc.local" }
])

// Insérer des logs de sécurité
db.security_logs.insertOne({
  timestamp: new Date(),
  source_ip: "192.168.1.105",
  event_type: "failed_login",
  severity: "medium"
})

// Insérer un incident
db.incidents.insertOne({
  title: "Brute Force détecté",
  status: "open",
  severity: "high",
  assigned_to: "analyst1",
  created_at: new Date()
})

// === REQUÊTES AVANCÉES ===

// Compter les incidents par sévérité
db.incidents.aggregate([
  { $group: { _id: "$severity", count: { $sum: 1 } } }
])

// Trouver les incidents ouverts critiques
db.incidents.find({ status: "open", severity: "critical" })

// Compter les alertes IDS par type
db.ids_alerts.aggregate([
  { $group: { _id: "$alert_type", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
])

// === INDEX ===
db.security_logs.createIndex({ source_ip: 1 })
db.incidents.createIndex({ status: 1, severity: 1 })
db.security_logs.createIndex({ timestamp: -1 })
```

## Backup MongoDB

Le dossier `data/mongo-backup/soc_lite/` contient l'export complet de la base :

| Fichier | Contenu |
|---------|---------|
| `users.bson` | Données des utilisateurs |
| `security_logs.bson` | Logs de sécurité |
| `incidents.bson` | Incidents créés |
| `ids_alerts.bson` | Alertes IDS |
| `*.metadata.json` | Métadonnées des collections |

### Restaurer la base

```bash
# Copier dans le conteneur
docker cp data/mongo-backup/ mongo-noseclab:/backup

# Restaurer
docker exec mongo-noseclab mongorestore --db soc_lite /backup/soc_lite/
```


## Rapport complet

Voir [`docs/rapport_TP2.pdf`](docs/rapport_TP2.pdf)

## Difficultés rencontrées

- Conception du modèle de données adapté au contexte SOC
- Syntaxe des pipelines d'agrégation MongoDB
- Gestion des index composés
