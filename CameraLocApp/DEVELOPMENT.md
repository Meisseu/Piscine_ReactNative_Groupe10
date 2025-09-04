# 👨‍💻 Guide de développement

## Structure du projet

```
CameraLocApp/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── MainNavigator.tsx
│   ├── screens/            # Écrans de l'application
│   │   ├── AuthScreen.tsx      # Authentification
│   │   ├── PermissionScreen.tsx # Gestion permissions
│   │   ├── CameraScreen.tsx    # Prise de photo
│   │   ├── MapScreen.tsx       # Vue carte
│   │   └── CalendarScreen.tsx  # Vue calendrier
│   ├── services/           # Services métier
│   │   ├── AuthService.ts      # Gestion utilisateurs
│   │   ├── PermissionService.ts # Gestion permissions
│   │   └── StorageService.ts   # Stockage local
│   ├── types/              # Types TypeScript
│   │   └── index.ts
│   └── utils/              # Utilitaires
│       └── uuid.ts            # Génération d'IDs
├── App.tsx                 # Point d'entrée principal
├── README.md              # Documentation utilisateur
└── start.md               # Guide de démarrage
```

## 🔧 Services principaux

### AuthService
- Gestion des utilisateurs local (inscription/connexion)
- Stockage avec AsyncStorage
- Validation des données

### StorageService
- Sauvegarde des photos avec métadonnées
- Gestion des lieux et objectifs
- Calcul des progressions hebdomadaires

### PermissionService
- Version simplifiée pour la démo
- À remplacer par react-native-permissions en production

## 📱 Écrans

### AuthScreen
- Interface de connexion/inscription
- Validation des formulaires
- Design moderne avec animations

### CameraScreen
- Simulation de prise de photo
- Modal pour nommer les lieux
- Gestion des objectifs de visite
- Galerie des photos récentes

### MapScreen
- Vue simplifiée de la carte
- Liste horizontale des photos/lieux
- Modals de détails avec progression
- Indicateurs colorés de progression

### CalendarScreen
- Calendrier fait maison
- Statistiques journalières/hebdomadaires/mensuelles
- Vue détaillée des photos par date
- Navigation entre les mois

## 🎨 Design System

### Couleurs
- Primary: `#3498db` (bleu)
- Success: `#27ae60` (vert)
- Warning: `#f39c12` (orange)
- Danger: `#e74c3c` (rouge)
- Background: `#f5f7fa` (gris clair)
- Text: `#2c3e50` (gris foncé)

### Spacing
- Padding containers: 20px
- Margin entre éléments: 15px
- Border radius: 10-15px

### Typography
- Titre principal: 24px, bold
- Titre section: 18px, bold
- Texte normal: 16px
- Texte secondaire: 14px
- Petite info: 12px

## 🔄 Flux de données

1. **Authentification** → AuthService → AsyncStorage
2. **Permissions** → PermissionService → État app
3. **Photos** → StorageService → AsyncStorage
4. **Lieux** → StorageService → AsyncStorage
5. **Navigation** → React Navigation

## 📊 Gestion d'état

L'application utilise les hooks React locaux :
- `useState` pour l'état des composants
- `useEffect` pour les effets de bord
- Props drilling pour le passage de données

Pour une application plus complexe, considérer :
- Redux Toolkit
- Context API
- Zustand

## 🚀 Déploiement

### Android
1. Générer un keystore
2. Configurer `build.gradle`
3. Exécuter `npx react-native run-android --variant=release`

### iOS
1. Configurer les certificats Xcode
2. Archiver depuis Xcode
3. Uploader vers App Store Connect

## 🧪 Tests

Structure recommandée :
```bash
__tests__/
├── components/
├── screens/
├── services/
└── utils/
```

Tests à implémenter :
- Tests unitaires des services
- Tests des composants avec React Native Testing Library
- Tests d'intégration E2E avec Detox

## 📚 Dépendances principales

### Navigation
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `react-native-safe-area-context`
- `react-native-screens`

### Stockage
- `@react-native-async-storage/async-storage`

### Production (à ajouter)
- `react-native-image-picker` - Caméra et galerie
- `react-native-geolocation-service` - GPS
- `react-native-permissions` - Permissions
- `react-native-maps` - Cartes
- `react-native-calendar-picker` - Calendrier

## 💡 Améliorations suggérées

### Performance
- Lazy loading des images
- Virtualisation des listes longues
- Memoization des composants lourds

### UX
- Animations de transition
- Feedback haptique
- États de chargement
- Messages d'erreur explicites

### Fonctionnalités
- Recherche et filtres
- Partage de photos
- Export des données
- Mode hors ligne

### Sécurité
- Chiffrement des données sensibles
- Validation côté serveur
- Authentification biométrique
