# Guide d'Export de la Base MongoDB

## Méthode 1 : Export via mongodump (Recommandé)

### Prérequis
- Docker Desktop en cours d'exécution
- Conteneur `mongo-soc` actif

### Commande PowerShell

```powershell
# Vérifier que le conteneur est actif
docker ps | findstr mongo-soc

# Méthode archive (fichier unique)
docker exec mongo-soc sh -c 'mongodump --authenticationDatabase admin -u admin -p secret --db soc_lite --archive' > soc_lite.archive

# Méthode dossier (fichiers séparés)
docker exec mongo-soc sh -c 'mongodump --authenticationDatabase admin -u admin -p secret --db soc_lite --out /tmp/dump'
docker cp mongo-soc:/tmp/dump ./soc_lite_dump
```

### Export JSON (pour visualisation)

```powershell
# Export users
docker exec mongo-soc mongosh -u admin -p secret --authenticationDatabase admin --eval "
    use soc_lite;
    db.users.find().forEach(doc => printjson(doc));
" > users.json

# Export security logs
docker exec mongo-soc mongosh -u admin -p secret --authenticationDatabase admin --eval "
    use soc_lite;
    db.security_logs.find().forEach(doc => printjson(doc));
" > security_logs.json
```

## Méthode 2 : Export via mongoexport (CSV/JSON)

```powershell
# Export users en JSON
docker exec mongo-soc mongoexport --authenticationDatabase admin -u admin -p secret --db soc_lite --collection users --jsonArray > users_export.json

# Export logs en JSON
docker exec mongo-soc mongoexport --authenticationDatabase admin -u admin -p secret --db soc_lite --collection security_logs --jsonArray > logs_export.json
```

## Méthode 3 : Script Automatisé

Exécuter le script PowerShell fourni :
```powershell
.\scripts\export-database.ps1
```

## Structure du Dump

```
soc_lite_dump/
├── soc_lite/
│   ├── users.bson              # Données binaires users
│   ├── users.metadata.json     # Métadonnées users
│   ├── security_logs.bson      # Données binaires logs
│   └── security_logs.metadata.json
├── users.json                  # Export JSON (lisible)
├── security_logs.json          # Export JSON (lisible)
└── soc_lite.archive            # Archive complète (optionnel)
```

## Données Actuelles dans la Base

### Collection `users`
| username | password | role |
|----------|----------|------|
| alice | motdepasse123 | analyst |
| bob | secret456 | admin |
| carol | carol789 | viewer |

### Collection `security_logs`
| src_ip | action | status |
|--------|--------|--------|
| 192.168.1.10 | login | open |
| 192.168.1.11 | logout | closed |
| 10.0.0.5 | alert | investigating |

## Restauration de la Base

```powershell
# Depuis une archive
docker exec -i mongo-soc sh -c 'mongorestore --authenticationDatabase admin -u admin -p secret --db soc_lite --archive' < soc_lite.archive

# Depuis un dossier
docker exec mongo-soc mongorestore --authenticationDatabase admin -u admin -p secret --db soc_lite /path/to/dump/soc_lite
```

Ou utiliser le script :
```powershell
.\scripts\restore-database.ps1
```
