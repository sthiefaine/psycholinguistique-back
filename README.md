# Backend API pour l'expérience psycholinguistique

Ce backend permet de recevoir et stocker automatiquement les résultats de l'expérience dans une base de données.

## 🚀 Installation

1. **Installer les dépendances:**
```bash
npm install
```

2. **Configurer la base de données:**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env et configurer DATABASE_URL
# Pour SQLite (développement): DATABASE_URL="file:./dev.db"
# Pour PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

3. **Initialiser Prisma:**
```bash
# Générer le client Prisma
npm run prisma:generate

# Créer la base de données et appliquer les migrations
npm run prisma:migrate
```

4. **Démarrer le serveur:**
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

## 📡 Endpoints API

### POST `/api/results`
Reçoit les résultats d'une expérience terminée.

**Body:**
```json
{
  "participant": {
    "id": "P001",
    "languageGroup": "L2",
    "startTime": "2025-07-18T23:31:09.455Z"
  },
  "experiment": {
    "config": { ... },
    "data": [ ... ],
    "endTime": "2025-07-18T23:32:04.040Z"
  }
}
```

### GET `/api/results/:participantId`
Récupère tous les résultats d'un participant.

### GET `/api/stats`
Récupère les statistiques globales.

### GET `/health`
Vérifie que le serveur fonctionne.

## 🔧 Configuration du frontend

Dans `js/config.js`, modifiez:

```javascript
const API_CONFIG = {
    endpoint: 'http://localhost:3000/api/results', // URL de votre backend
    enabled: true, // Activez l'envoi automatique
    timeout: 10000
};
```

## 🗄️ Base de données

Le schéma Prisma définit trois modèles:
- **Participant**: Informations sur les participants (inclut l'adresse IP)
- **Experiment**: Configuration et métadonnées des expériences
- **Trial**: Détails de chaque essai (phrase, réponse, temps, etc.)

### 📡 Adresse IP

L'adresse IP de l'utilisateur est automatiquement extraite et enregistrée lors de l'envoi des résultats. Le serveur :
- Extrait l'IP depuis la requête HTTP
- Gère les proxies (x-forwarded-for)
- Stocke l'IP dans le champ `ipAddress` du modèle Participant

### Visualiser les données

```bash
npm run prisma:studio
```

Cela ouvre Prisma Studio dans votre navigateur pour visualiser et éditer les données.

## 🚢 Déploiement

### Déploiement sur Hetzner avec Coolify

Ce projet est configuré pour être déployé facilement sur Hetzner avec Coolify.

#### Prérequis
1. Un serveur Hetzner avec Coolify installé
2. Une base de données PostgreSQL (peut être créée via Coolify)

#### Étapes de déploiement

1. **Créer une nouvelle application dans Coolify**
   - Connectez-vous à votre instance Coolify
   - Cliquez sur "New Resource" → "Application"
   - Sélectionnez "GitHub" ou "Git" et connectez votre repository

2. **Configurer l'application**
   - **Build Pack**: Docker
   - **Dockerfile**: Le Dockerfile est déjà présent dans le projet
   - **Port**: 3000 (par défaut)

3. **Configurer les variables d'environnement**
   Dans Coolify, ajoutez ces variables d'environnement :
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   PORT=3000
   NODE_ENV=production
   ```
   
   **Important**: Remplacez `DATABASE_URL` par l'URL de votre base de données PostgreSQL créée via Coolify.

4. **Créer la base de données PostgreSQL**
   - Dans Coolify, créez une nouvelle ressource "PostgreSQL"
   - Notez l'URL de connexion (ou utilisez la variable d'environnement générée automatiquement)
   - Copiez l'URL dans la variable `DATABASE_URL` de votre application

5. **Déployer**
   - Coolify détectera automatiquement le Dockerfile
   - Le build compilera TypeScript et générera le client Prisma
   - Les migrations Prisma seront exécutées automatiquement au démarrage
   - L'application sera accessible sur le domaine configuré dans Coolify

#### Notes importantes
- Les migrations Prisma s'exécutent automatiquement au démarrage via `prisma migrate deploy`
- Le Dockerfile utilise un build multi-stage pour optimiser la taille de l'image
- L'application s'exécute avec un utilisateur non-root pour la sécurité
- Assurez-vous que votre base de données PostgreSQL est accessible depuis le conteneur

### Autres options de déploiement

#### Option 1: Vercel / Netlify Functions
Créez une fonction serverless qui utilise Prisma.

#### Option 2: Serveur dédié
- Déployez sur Heroku, Railway, ou un VPS
- Configurez une base de données PostgreSQL
- Mettez à jour `DATABASE_URL` dans `.env`

#### Option 3: Docker Compose
Utilisez le Dockerfile fourni avec Docker Compose pour un déploiement local.

## 📝 Notes

- Par défaut, SQLite est utilisé pour le développement (fichier `dev.db`)
- Pour la production, utilisez PostgreSQL ou MySQL
- Les données sont automatiquement liées (participant → experiment → trials)
- CORS est activé pour permettre les requêtes depuis le frontend

