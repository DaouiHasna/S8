# TP3 — Sécurité MongoDB : Authentification & Contrôle d'Accès (RBAC)

## Objectifs

- Démonstration de la vulnérabilité d'un MongoDB sans authentification (`mongo_insecure`)
- Mise en place de l'authentification MongoDB (`--auth`)
- Création d'utilisateurs avec des rôles différenciés (RBAC)
- Création de rôles personnalisés (custom roles)
- Vérification des droits d'accès et tests de violation

## Technologies utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| Docker | ≥ 20.x | Conteneurisation |
| MongoDB | 7.0 | Base de données NoSQL |
| mongosh | 2.8.1 | Shell interactif |

## Scénario du TP

Le TP compare deux environnements :

| Conteneur | Mode | Description |
|-----------|------|-------------|
| `mongo_insecure` | Sans auth | Port 27018 — accès libre |
| `mongo_secure1` | Avec `--auth` | Port 27017 — authentification obligatoire |

## Phase 1 — MongoDB non sécurisé

```bash
# Lancer un MongoDB sans authentification (vulnérable)
docker run -d --name mongo_insecure -p 27018:27017 mongo:7

# Accès sans credentials
docker exec -it mongo_insecure mongosh

# Preuve de vulnérabilité : insertion sans authentification
use soc_lite
db.security_logs.insertOne({
  timestamp: new Date(),
  source_ip: "10.0.0.99",
  event_type: "test_insecure",
  message: "Ce document a été inséré sans authentification"
})
```

**Résultat** : Toute insertion/lecture/suppression est possible sans aucun credential.

## Phase 2 — MongoDB sécurisé avec --auth

```bash
# Lancer un MongoDB avec authentification activée
docker run -d --name mongo_secure1 -p 27017:27017 mongo:7 --auth

# Accéder en tant qu'admin
docker exec -it mongo_secure1 mongosh
```

### Création du compte admin

```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "AdminSecure2026!",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})
```

## Phase 3 — Rôles et utilisateurs SOC

### Rôle personnalisé : `incidentManager`

```javascript
use soc_lite
db.createRole({
  role: "incidentManager",
  privileges: [
    {
      resource: { db: "soc_lite", collection: "incidents" },
      actions: ["find", "insert", "update", "remove"]
    }
  ],
  roles: []
})
```

### Utilisateurs créés

```javascript
// Application SOC — lecture/écriture complète
db.createUser({
  user: "soc_app",
  pwd: "AppP@ss2026!",
  roles: [{ role: "readWrite", db: "soc_lite" }]
})

// Analyste — lecture seule
db.createUser({
  user: "soc_analyst_ro",
  pwd: "AnalystR0@2026!",
  roles: [{ role: "read", db: "soc_lite" }]
})

// Manager — gestion des incidents uniquement
db.createUser({
  user: "soc_manager",
  pwd: "Mgr$ecure2026!",
  roles: [{ role: "incidentManager", db: "soc_lite" }]
})
```

## Phase 4 — Tests de contrôle d'accès

### Analyste (read-only) — tentative d'écriture

```bash
docker exec -it mongo_secure1 mongosh \
  "mongodb://soc_analyst_ro:AnalystR0%402026!@localhost:27017/soc_lite?authSource=soc_lite" \
  --eval "db.security_logs.insertOne({event_type:'test_write'})"

# Résultat : MongoServerError: not authorized on soc_lite to execute command { insert: ... }
```

### Manager — accès limité aux incidents

```bash
# Connexion manager
docker exec -it mongo_secure1 mongosh \
  "mongodb://soc_manager:Mgr$ecure2026!@localhost:27017/soc_lite?authSource=soc_lite"

# Autorisé : modifier un incident
db.incidents.updateOne(
  { incident_id: "INC-2026-0042" },
  { $set: { status: "investigating" } }
)  # ✅ OK

# Refusé : lire les logs (hors périmètre du rôle)
db.security_logs.find().limit(1)  # ❌ MongoServerError[Unauthorized]
```

### Application SOC — accès complet

```javascript
// Connexion soc_app (readWrite)
db.security_logs.insertOne({
  timestamp: new Date(),
  source_ip: "10.0.2.100",
  event_type: "firewall_drop",
  severity: "info",
  message: "Paquet TCP bloqué par règle DROP"
})  // ✅ OK
```

## Résumé des droits RBAC

| Utilisateur | Rôle | security_logs | incidents | users | ids_alerts |
|-------------|------|:---:|:---:|:---:|:---:|
| `soc_app` | readWrite | R/W | R/W | R/W | R/W |
| `soc_analyst_ro` | read | R | R | R | R |
| `soc_manager` | incidentManager | ❌ | R/W | ❌ | ❌ |

## Scripts

Voir `commands.txt` pour l'intégralité des commandes exécutées pendant la séance.

## Screenshots (27 captures)

| Plage | Description |
|-------|-------------|
| `1.png` – `5.png` | Environnement insécurisé — preuve d'accès sans auth |
| `6.png` – `10.png` | Lancement du conteneur sécurisé et création admin |
| `11.png` – `15.png` | Création des rôles et utilisateurs |
| `18.png` – `20.png` | Tests de violation de droits (analyste) |
| `21.png` – `25.png` | Tests manager et soc_app |
| `26.png` – `29.png` | Vérification finale des utilisateurs et rôles |

## Rapport complet

Voir [`docs/rapport_TP3.pdf`](docs/rapport_TP3.pdf)

## Difficultés rencontrées

- Gestion des conflits de ports entre les deux conteneurs
- Encodage URL des mots de passe avec caractères spéciaux (`@` → `%40`)
- Compréhension fine des héritages de rôles MongoDB
