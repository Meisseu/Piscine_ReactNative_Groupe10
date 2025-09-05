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

## 📱 **PROTOCOLE COMPLET DE TEST AVEC EXPO SNACK**

### **🎯 Prérequis**
- **Téléphone Android/iOS** avec Expo Go installé
- **Connexion Internet** stable
- **Permissions** caméra et localisation activées sur le téléphone

### **📋 Étapes Détaillées**

#### **1. Installation d'Expo Go**
- **Android** : [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS** : [App Store](https://apps.apple.com/app/expo-go/id982107779)

#### **2. Accès à Expo Snack**
1. **Ouvrez votre navigateur** sur : https://snack.expo.dev
2. **Créez un compte** ou connectez-vous
3. **Cliquez** sur "Create a new Snack"

#### **3. Configuration du Projet**
1. **Supprimez** tout le code par défaut dans l'éditeur
2. **Ouvrez** le fichier `ExpoVersionModern.js` de ce repository
3. **Copiez TOUT** le contenu (Ctrl+A, Ctrl+C)
4. **Collez** dans l'éditeur Expo Snack (Ctrl+V)

#### **4. Vérification des Dépendances**
Expo Snack devrait automatiquement détecter et installer :
- `expo-camera`
- `expo-location`
- `react-native-maps`
- `@react-native-async-storage/async-storage`
- `react-native-vector-icons`

#### **5. Test sur Téléphone**
1. **Cliquez** sur "Run" dans Expo Snack
2. **Scannez le QR code** avec Expo Go
3. **Attendez** le chargement de l'application
4. **Autorisez** les permissions caméra et localisation

### **🧪 Tests Fonctionnels à Effectuer**

#### **✅ Test d'Authentification**
1. **Créez un compte** avec nom, email, mot de passe
2. **Connectez-vous** avec les identifiants
3. **Vérifiez** l'affichage du nom dans l'en-tête
4. **Testez** la déconnexion

#### **✅ Test de la Caméra**
1. **Cliquez** sur l'onglet "📷 Camera"
2. **Cliquez** sur "Prendre Photo"
3. **Autorisez** l'accès à la caméra
4. **Prenez** une vraie photo
5. **Vérifiez** la prévisualisation
6. **Cliquez** "Valider"

#### **✅ Test de Géolocalisation**
1. **Autorisez** l'accès à la localisation
2. **Vérifiez** que la position GPS est capturée
3. **Nommez** le lieu (ex: "Mon Bureau")
4. **Définissez** un objectif (ex: 3 visites/semaine)
5. **Sauvegardez** la photo

#### **✅ Test de la Carte Interactive**
1. **Cliquez** sur l'onglet "🗺️ Explorer"
2. **Vérifiez** l'affichage de la carte
3. **Zoomez/dézoomez** avec les gestes
4. **Cliquez** sur un marqueur
5. **Vérifiez** l'affichage du callout avec les détails

#### **✅ Test du Journal**
1. **Cliquez** sur l'onglet "📅 Journal"
2. **Vérifiez** les statistiques (Photos, Lieux, Objectifs)
3. **Cliquez** sur une photo dans la timeline
4. **Vérifiez** l'affichage des détails
5. **Testez** la suppression d'une photo

#### **✅ Test du Profil**
1. **Cliquez** sur l'onglet "👤 Profil"
2. **Vérifiez** l'affichage des informations
3. **Cliquez** sur "Modifier"
4. **Changez** le nom ou l'email
5. **Sauvegardez** et vérifiez les changements

### **🔧 Dépannage Courant**

#### **❌ Problème : "Expo Go ne trouve pas l'app"**
- **Solution** : Vérifiez que le QR code est bien scanné
- **Alternative** : Utilisez le lien direct dans Expo Go

#### **❌ Problème : "Permissions refusées"**
- **Solution** : Allez dans Paramètres > Applications > Expo Go > Permissions
- **Activez** Caméra et Localisation

#### **❌ Problème : "Carte ne s'affiche pas"**
- **Solution** : Vérifiez la connexion Internet
- **Alternative** : Redémarrez l'application

#### **❌ Problème : "Caméra ne s'ouvre pas"**
- **Solution** : Fermez et rouvrez Expo Go
- **Vérifiez** que l'appareil photo n'est pas utilisé par une autre app

### **📊 Validation des Fonctionnalités**

#### **🎯 Checklist Complète**
- [ ] **Authentification** : Création de compte et connexion
- [ ] **Caméra** : Prise de photo avec vraie caméra
- [ ] **Géolocalisation** : Position GPS capturée
- [ ] **Carte** : Marqueurs affichés avec callouts
- [ ] **Journal** : Timeline avec statistiques
- [ ] **Profil** : Modification des informations
- [ ] **Objectifs** : Création et suivi des objectifs
- [ ] **Navigation** : Passage fluide entre onglets

### **💡 Conseils Avancés**

#### **🎯 Optimisation des Tests**
- **Testez en extérieur** pour une meilleure géolocalisation GPS
- **Prenez plusieurs photos** pour tester la carte interactive
- **Créez différents objectifs** pour tester le système de progression
- **Testez sur différents appareils** (Android/iOS)

#### **📱 Fonctionnalités à Explorer**
- **Système d'objectifs** : Créez un objectif de 5 visites/semaine
- **Lieux existants** : Ajoutez des photos à des lieux déjà visités
- **Statistiques** : Vérifiez la mise à jour des compteurs
- **Interface responsive** : Testez en mode portrait/paysage

#### **🔍 Points d'Attention**
- **Performance** : L'application doit être fluide
- **Permissions** : Toutes les permissions doivent être gérées
- **Données** : Les photos et localisations doivent être persistantes
- **UI/UX** : L'interface doit être intuitive et moderne

### **📸 Workflow de Test Complet**

#### **🔄 Scénario de Test Standard**
1. **Installation** : Expo Go + Expo Snack
2. **Authentification** : Création de compte
3. **Première photo** : Bureau avec objectif 3x/semaine
4. **Deuxième photo** : Même lieu (test lieu existant)
5. **Troisième photo** : Nouveau lieu (parc)
6. **Vérification carte** : 2 marqueurs visibles
7. **Vérification journal** : 3 photos dans timeline
8. **Vérification profil** : Statistiques mises à jour
9. **Test objectifs** : Progression affichée
10. **Test déconnexion** : Retour à l'écran de connexion

### **🚀 Version React Native CLI (Production)**
```bash
cd CameraLocApp
npm install
npx react-native run-android  # ou run-ios
```

### **🔧 Backend (Optionnel)**
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
