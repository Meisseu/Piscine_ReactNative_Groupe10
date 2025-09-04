# 📸 Journal de Voyage - CameraLocApp

Une application React Native complète pour créer un journal de voyage interactif avec géolocalisation et suivi d'objectifs.

## 🌟 Fonctionnalités

### 🔐 Authentification
- Système de connexion/inscription local
- Gestion sécurisée des utilisateurs
- Persistance de la session

### 📱 Gestion des permissions
- Demande d'autorisation pour la caméra
- Demande d'autorisation pour la géolocalisation
- Interface claire pour expliquer les besoins

### 📷 Prise de photos
- Capture directe depuis la caméra
- Sélection depuis la galerie
- Géolocalisation automatique des photos
- Association à des lieux nommés

### 🗺️ Carte interactive
- Visualisation de toutes les photos sur une carte
- Marqueurs distincts pour photos et lieux
- Indicateurs de progression pour les objectifs de visite
- Détails des photos au clic

### 📅 Calendrier
- Vue calendaire des photos par date
- Statistiques quotidiennes, hebdomadaires et mensuelles
- Navigation intuitive entre les dates
- Détails complets des photos

### 🎯 Suivi d'objectifs
- Définition d'objectifs de visite par lieu
- Jauges de progression hebdomadaire
- Suivi automatique des visites
- Réinitialisation hebdomadaire

## 🛠️ Installation

### Prérequis
- Node.js (v14 ou supérieur)
- React Native CLI
- Android Studio (pour Android)
- Xcode (pour iOS)

### Installation des dépendances
```bash
cd CameraLocApp
npm install
```

### Configuration iOS
```bash
cd ios
pod install
cd ..
```

### Lancement de l'application

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## 📱 Utilisation

### 1. Première connexion
- Créez un compte avec votre email et un mot de passe
- Ou connectez-vous si vous avez déjà un compte

### 2. Permissions
- Autorisez l'accès à la caméra pour prendre des photos
- Autorisez l'accès à la localisation pour géolocaliser vos photos

### 3. Navigation
L'application propose 3 onglets principaux :

#### 📷 Caméra
- **Prendre une photo** : Capture directe avec l'appareil photo
- **Choisir depuis la galerie** : Sélection d'une photo existante
- **Nommer le lieu** : Association optionnelle à un lieu
- **Définir un objectif** : Nombre de visites souhaitées par semaine

#### 🗺️ Carte
- **Marqueurs bleus** : Photos individuelles
- **Marqueurs colorés** : Lieux avec progression
  - 🔴 Rouge : < 50% de l'objectif
  - 🟠 Orange : 50-74% de l'objectif
  - 🟡 Jaune : 75-99% de l'objectif
  - 🟢 Vert : 100%+ de l'objectif

#### 📅 Calendrier
- **Statistiques en haut** : Photos du jour/semaine/mois
- **Calendrier interactif** : Dates avec photos marquées en bleu
- **Liste des photos** : Photos de la date sélectionnée

### 4. Fonctionnalités avancées

#### Lieux et objectifs
- Nommez vos lieux favoris lors de la prise de photo
- Définissez un objectif de visites par semaine
- Suivez votre progression en temps réel
- La jauge se remet à zéro chaque lundi

#### Navigation entre les écrans
- Cliquez sur une photo dans le calendrier pour voir ses détails
- Cliquez sur un marqueur de la carte pour voir les infos du lieu
- Naviguez facilement entre les différentes vues

## 🏗️ Architecture

### Structure du projet
```
src/
├── components/          # Composants réutilisables
│   └── MainNavigator.tsx
├── screens/            # Écrans de l'application
│   ├── AuthScreen.tsx
│   ├── PermissionScreen.tsx
│   ├── CameraScreen.tsx
│   ├── MapScreen.tsx
│   └── CalendarScreen.tsx
├── services/           # Services métier
│   ├── AuthService.ts
│   ├── PermissionService.ts
│   └── StorageService.ts
├── types/              # Types TypeScript
│   └── index.ts
└── utils/              # Fonctions utilitaires
```

### Technologies utilisées
- **React Native** : Framework mobile
- **TypeScript** : Typage statique
- **React Navigation** : Navigation entre écrans
- **AsyncStorage** : Stockage local
- **React Native Maps** : Cartes interactives
- **React Native Image Picker** : Caméra et galerie
- **React Native Geolocation** : Géolocalisation
- **React Native Permissions** : Gestion des permissions
- **React Native Calendar Picker** : Calendrier

## 📊 Gestion des données

### Stockage local
Toutes les données sont stockées localement sur l'appareil :
- **Utilisateurs** : Informations de connexion
- **Photos** : Métadonnées et chemins des images
- **Lieux** : Informations des lieux et objectifs

### Sécurité
- Mots de passe stockés en clair (à améliorer en production)
- Données isolées par utilisateur
- Pas de synchronisation cloud

## 🎯 Objectifs et progression

### Système de jauges
- Objectif défini en nombre de visites par semaine
- Compteur remis à zéro chaque lundi
- Progression affichée en pourcentage
- Couleurs indiquant le niveau d'atteinte

### Calcul automatique
- Incrémentation automatique à chaque photo géolocalisée
- Association intelligente aux lieux existants
- Gestion des semaines calendaires

## 🚀 Améliorations futures

### Fonctionnalités possibles
- [ ] Synchronisation cloud
- [ ] Partage de photos
- [ ] Filtres et recherche avancée
- [ ] Export des données
- [ ] Notifications de rappel
- [ ] Mode hors ligne amélioré
- [ ] Chiffrement des données
- [ ] Support multi-langues

### Optimisations techniques
- [ ] Cache d'images optimisé
- [ ] Compression automatique des photos
- [ ] Base de données SQLite
- [ ] Tests unitaires et d'intégration
- [ ] Performance monitoring

## 🐛 Dépannage

### Problèmes courants

#### Permissions refusées
- Aller dans Paramètres > Applications > CameraLocApp > Permissions
- Activer Caméra et Localisation

#### Photos non géolocalisées
- Vérifier que la localisation est activée
- S'assurer d'être à l'extérieur ou près d'une fenêtre
- Attendre quelques secondes pour l'acquisition GPS

#### Application qui plante
- Redémarrer l'application
- Vérifier les logs de développement
- S'assurer que toutes les dépendances sont installées

## 📄 Licence

Ce projet est un exercice éducatif dans le cadre de la formation IPSSI.

## 👥 Contributeurs

Développé dans le cadre du projet Piscine React Native - IPSSI 2025
