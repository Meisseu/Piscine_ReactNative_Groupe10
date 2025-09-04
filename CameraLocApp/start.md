# 🚀 Guide de démarrage rapide

## Prérequis
- Node.js installé
- Android Studio configuré (pour Android)
- Xcode configuré (pour iOS sur Mac)

## Installation et lancement

### 1. Installer les dépendances
```bash
cd CameraLocApp
npm install
```

### 2. Pour iOS (Mac uniquement)
```bash
cd ios
pod install
cd ..
```

### 3. Démarrer Metro (serveur de développement)
```bash
npx react-native start
```

### 4. Lancer l'application
#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## 📱 Fonctionnalités de la version démo

### ✅ Implémenté
- ✅ Authentification locale (création de compte/connexion)
- ✅ Navigation entre 3 écrans (Camera, Carte, Calendrier)
- ✅ Simulation de prise de photo avec géolocalisation
- ✅ Stockage local des photos et métadonnées
- ✅ Système de lieux avec objectifs de visite
- ✅ Calendrier interactif fait maison
- ✅ Carte simplifiée avec liste des photos/lieux
- ✅ Jauges de progression hebdomadaire
- ✅ Interface moderne et responsive

### 🔄 Version simplifiée (pour éviter les conflits de dépendances)
- Photos simulées avec images aléatoires (Picsum)
- Géolocalisation simulée autour de Paris
- Calendrier fait maison au lieu de react-native-calendar-picker
- Vue carte simplifiée au lieu de react-native-maps
- Permissions simulées

### 🎯 Expérience utilisateur complète
1. **Créer un compte** avec email/mot de passe
2. **"Accepter" les permissions** (simulées)
3. **Simuler une prise de photo** depuis l'onglet Caméra
4. **Nommer le lieu** et définir un objectif de visites
5. **Voir la photo sur la carte** dans l'onglet Carte
6. **Consulter le calendrier** pour voir les photos par date
7. **Suivre la progression** des objectifs de visite

## 🛠️ Pour une version production

Pour une version complète, vous devriez :

1. **Configurer les vraies dépendances** :
```bash
npm install react-native-image-picker react-native-geolocation-service
npm install react-native-permissions react-native-maps
npm install react-native-calendar-picker
```

2. **Configurer les permissions natives** (déjà fait dans les fichiers)

3. **Implémenter la vraie géolocalisation** dans PermissionService.ts

4. **Intégrer react-native-maps** dans MapScreen.tsx

5. **Utiliser react-native-image-picker** dans CameraScreen.tsx

## 📊 Architecture de l'application

- **TypeScript** pour la sécurité des types
- **React Navigation** pour la navigation
- **AsyncStorage** pour le stockage local
- **Services pattern** pour la logique métier
- **Hooks React** pour la gestion d'état
- **Styled Components** pour le design

L'application est entièrement fonctionnelle en mode démo et peut être facilement étendue pour utiliser les vraies APIs natives.
