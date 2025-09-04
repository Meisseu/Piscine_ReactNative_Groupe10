# 📷 Camera Loc Backend API

Backend Node.js/Express pour l'application Camera Loc qui permet de gérer les photos réelles prises avec l'appareil photo du téléphone.

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Ou démarrer en mode production
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

## 📁 Structure

```
camera-loc-backend/
├── server.js          # Serveur principal Express
├── database.js        # Gestion base de données SQLite
├── uploads/           # Dossier pour les images uploadées
├── .env              # Configuration environnement
└── database.sqlite   # Base de données SQLite (créée automatiquement)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Photos
- `POST /api/photos` - Upload une photo (multipart/form-data)
- `GET /api/photos/:userId` - Récupérer les photos d'un utilisateur  
- `DELETE /api/photos/:photoId` - Supprimer une photo

### Lieux
- `POST /api/locations` - Créer un lieu
- `GET /api/locations/:userId` - Récupérer les lieux d'un utilisateur

### Système
- `GET /api/health` - Vérifier l'état du serveur
- `GET /` - Documentation de l'API

## 📤 Upload de Photos

Format multipart/form-data avec les champs :
- `photo` : Le fichier image (max 10MB)
- `latitude` : Latitude GPS
- `longitude` : Longitude GPS  
- `locationName` : Nom du lieu (optionnel)
- `userId` : ID de l'utilisateur
- `timestamp` : Horodatage (optionnel)

## 🗄️ Base de Données

SQLite avec les tables :
- `users` - Utilisateurs
- `photos` - Photos avec métadonnées GPS
- `locations` - Lieux avec objectifs de visites
- `location_photos` - Liaison photos-lieux

## 🔧 Configuration

Variables d'environnement dans `.env` :
- `PORT=3000` - Port du serveur
- `DB_PATH=./database.sqlite` - Chemin base de données
- `UPLOAD_PATH=./uploads` - Dossier uploads
- `MAX_FILE_SIZE=10485760` - Taille max fichier (10MB)
- `CORS_ORIGIN=*` - Origine CORS autorisée

## 🖼️ Accès aux Images

Les images uploadées sont accessibles via :
`http://localhost:3000/uploads/nom-du-fichier.jpg`

## 📱 Intégration React Native

Pour utiliser ce backend avec votre app React Native, configurez l'URL de base :

```javascript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
// Remplacez YOUR_IP par votre adresse IP locale (pas localhost)
```

## 🔒 Sécurité

⚠️ **Version de développement** :
- Mots de passe non hashés
- CORS ouvert (*)
- Pas d'authentification JWT

Pour la production, ajouter :
- Hash des mots de passe (bcrypt)
- JWT pour l'authentification
- CORS restrictif
- Validation renforcée
- HTTPS obligatoire
