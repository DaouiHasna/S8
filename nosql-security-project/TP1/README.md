# TP1 — Introduction à MongoDB & Environnement NoSQL Lab

## Objectifs

- Mise en place de l'environnement Docker MongoDB
- Prise en main de MongoDB Shell (`mongosh`)
- Manipulation de la base de données `noseclab`
- Exploration des collections de logs de sécurité
- Premières requêtes d'analyse sur des données de sécurité

## Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| Docker | ≥ 20.x | Conteneurisation |
| MongoDB | 7.0 | Base de données NoSQL |
| mongosh | 2.8.1 | Shell interactif MongoDB |

## Environnement

```bash
# Lancer le conteneur MongoDB
docker run -d --name mongo-noseclab -p 27017:27017 mongo:7

# Accéder au shell
docker exec -it mongo-noseclab mongosh

# Base de données utilisée
use noseclab
```

## Principales commandes effectuées

```javascript
// Lister les bases de données
show dbs

// Sélectionner la base noseclab
use noseclab

// Lister les collections
show collections

// Compter les documents de sécurité
db.security_logs.countDocuments()

// Aperçu d'un document
db.security_logs.findOne()

// Requêtes filtrées
db.security_logs.find({ level: "ERROR" })
db.security_logs.find({ source_ip: "192.168.1.1" })
```

## Structure de la base `noseclab`

```
noseclab/
└── security_logs        # Logs d'événements de sécurité
    ├── _id              # ObjectId unique
    ├── timestamp        # Date/heure de l'événement
    ├── level            # Niveau (INFO, WARNING, ERROR, CRITICAL)
    ├── source_ip        # IP source
    ├── action           # Action effectuée
    └── message          # Description de l'événement
```

## Données de sauvegarde

Le dossier `data/noseclab_backup/` contient l'export BSON de la base utilisée pendant le TP :
- `security_logs.bson` — données des logs de sécurité
- `security_logs.metadata.json` — métadonnées de la collection
- `prelude.json` — configuration de la sauvegarde

### Restaurer la base

```bash
# Copier les fichiers dans le conteneur
docker cp data/noseclab_backup/ mongo-noseclab:/backup

# Restaurer
docker exec mongo-noseclab mongorestore --db noseclab /backup/
```


## Rapport complet

Voir [`docs/rapport_TP1.pdf`](docs/rapport_TP1.pdf)

## Difficultés rencontrées

- Configuration initiale du réseau Docker
- Adaptation à la syntaxe JavaScript de mongosh
- Compréhension du format BSON
