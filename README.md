# 📸 CameraLoc - Journal de Voyage Interactif

## 🎯 Description du Projet

**CameraLoc** est une application React Native innovante qui transforme la simple prise de photo en expérience interactive de documentation de vie. L'application permet aux utilisateurs de capturer des moments avec leur caméra native, de les géolocaliser automatiquement et de les organiser sur une carte interactive et dans un journal chronologique.

## ✨ Fonctionnalités Principales

### 📱 Interface Moderne
- **4 onglets principaux** : Camera, Explorer, Journal, Profil
- **Design épuré** avec animations fluides
- **Navigation intuitive** par onglets
- **Interface responsive** et accessible

### 📷 Caméra Native
- **Vraie caméra** de l'appareil (pas de simulation)
- **Géolocalisation GPS** automatique et précise
- **Validation des photos** avec prévisualisation
- **Gestion des permissions** caméra et localisation

### 🗺️ Carte Interactive
- **Carte réelle** avec marqueurs personnalisés
- **Callouts détaillés** avec informations des photos
- **Navigation fluide** sur la carte
- **Affichage des objectifs** de visite

### 📅 Journal Chronologique
- **Timeline organisée** par date
- **Statistiques personnelles** : Photos, Lieux, Objectifs
- **Vue détaillée** des souvenirs
- **Suppression** des photos

### 👤 Profil Utilisateur
- **Gestion des informations** personnelles
- **Modification** du nom, email, mot de passe
- **Statistiques** de l'utilisateur
- **Authentification** sécurisée

### 🎯 Système d'Objectifs
- **Objectifs hebdomadaires** configurables
- **Suivi de progression** avec jauge visuelle
- **Motivation** par récompenses visuelles
- **Ajout de photos** à des lieux existants

## 🏗️ Architecture Technique

### Frontend
- **React Native** avec Expo Snack pour le développement
- **React Native CLI** pour la version production
- **TypeScript** pour la robustesse du code
- **AsyncStorage** pour le stockage local

### Backend
- **Node.js/Express** pour l'API
- **SQLite** pour la base de données
- **Multer** pour la gestion des uploads
- **CORS/Helmet** pour la sécurité

### Fonctionnalités Natives
- **expo-camera** : Accès à l'appareil photo
- **expo-location** : Géolocalisation GPS
- **react-native-maps** : Cartes interactives
- **react-native-permissions** : Gestion des autorisations

## 👥 Personas Ciblées

### 🏋️‍♂️ Le Sportif Méthodique
- **Objectif** : Suivre ses habitudes d'entraînement
- **Usage** : Créer des objectifs de visite à la salle de sport
- **Valeur** : Motivation par la progression visuelle

### ✈️ La Voyageuse Sentimentale
- **Objectif** : Organiser ses souvenirs de voyage
- **Usage** : Documenter chaque destination visitée
- **Valeur** : Collection organisée de souvenirs géolocalisés

### 👨‍👩‍👧‍👦 Le Parent Organisé
- **Objectif** : Créer des souvenirs familiaux
- **Usage** : Documenter les activités familiales
- **Valeur** : Patrimoine numérique transmissible

## 🚀 Installation et Utilisation

### Version Expo (Recommandée pour les tests)
1. Allez sur [Expo Snack](https://snack.expo.dev)
2. Créez un nouveau projet
3. Copiez le contenu de `ExpoVersionModern.js`
4. Scannez le QR code avec Expo Go

### Version React Native CLI (Production)
```bash
cd CameraLocApp
npm install
npx react-native run-android  # ou run-ios
```

### Backend
```bash
cd camera-loc-backend
npm install
npm run dev
```

## 📁 Structure du Projet

```
Projet_camera_loc/
├── ExpoVersionModern.js          # Version principale (Expo Snack)
├── ExpoVersion.js                # Version simplifiée
├── CameraLocApp/                 # Version React Native CLI
│   ├── src/
│   │   ├── components/           # Composants de navigation
│   │   ├── screens/              # Écrans principaux
│   │   ├── services/             # Services métier
│   │   └── types/                # Définitions TypeScript
│   └── android/ios/              # Configuration native
└── camera-loc-backend/           # Backend Node.js/Express
    ├── server.js                 # Serveur API
    ├── database.js               # Gestion SQLite
    └── uploads/                  # Stockage des images
```

## 🎨 Design et UX

### Interface Moderne
- **Palette de couleurs** cohérente (#6C63FF, #2D3748, #718096)
- **Animations fluides** pour l'engagement
- **Emojis stratégiques** pour la navigation
- **Cartes modernes** avec ombres et bordures arrondies

### Expérience Utilisateur
- **Workflow intuitif** : Photo → Validation → Localisation → Sauvegarde
- **Feedback visuel** pour toutes les actions
- **Gestion d'erreurs** avec messages explicites
- **Accessibilité** avec contrastes appropriés

## 🔧 Développement

### Technologies Utilisées
- **React Native** 0.72+
- **Expo SDK** 49+
- **Node.js** 18+
- **SQLite** 3+
- **TypeScript** 4+

### Méthodologie
- **Développement itératif** avec tests utilisateur
- **Prototypage rapide** avec Expo Snack
- **Migration progressive** vers React Native CLI
- **Tests continus** via QR code

## 📊 Fonctionnalités Avancées

### Géolocalisation
- **GPS précis** avec gestion des erreurs
- **Fallback** vers position par défaut
- **Permissions** gérées automatiquement

### Gestion des Données
- **Stockage local** avec AsyncStorage
- **Synchronisation** avec backend
- **Sauvegarde** automatique des photos

### Sécurité
- **Authentification** utilisateur
- **Validation** des données
- **Gestion** des permissions

## 🎯 Innovation

### Différenciation
- **Vraie caméra** native (pas de simulation)
- **Géolocalisation** automatique et précise
- **Carte interactive** avec callouts détaillés
- **Système d'objectifs** avec suivi visuel
- **Interface moderne** et engageante

### Valeur Ajoutée
- **Transformation** de la prise de photo en expérience
- **Organisation** automatique des souvenirs
- **Motivation** par les objectifs et la progression
- **Partage** facile des expériences

## 📱 Compatibilité

- **Android** 6.0+ (API 23+)
- **iOS** 11.0+
- **Expo Go** pour les tests
- **React Native CLI** pour la production

## 🤝 Contribution

Ce projet a été développé dans le cadre de la Piscine React Native du Groupe 10.

## 📄 Licence

Ce projet est sous licence MIT.

---

**CameraLoc - Transformez vos moments en souvenirs organisés et interactifs !** 📸✨
