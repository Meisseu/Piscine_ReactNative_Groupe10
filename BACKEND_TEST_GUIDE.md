# 📱 Guide de Test avec Backend et Vraies Photos

Ce guide vous explique comment tester votre application Camera Loc avec de vraies photos prises par l'appareil photo du téléphone.

## 🚀 Étape 1: Démarrer le Backend

```bash
# Aller dans le dossier backend
cd camera-loc-backend

# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer le serveur
npm run dev
```

✅ **Le serveur doit afficher** :
```
🚀 Serveur démarré sur http://localhost:3000
📱 API disponible sur http://localhost:3000/api
🖼️ Uploads disponibles sur http://localhost:3000/uploads
```

## 🔧 Étape 2: Configurer l'Adresse IP

### **Trouver votre adresse IP locale** :

**Windows** :
```bash
ipconfig
# Cherchez "IPv4 Address" dans votre connexion WiFi
# Exemple: 192.168.1.100
```

**Mac/Linux** :
```bash
ifconfig | grep inet
# Cherchez une adresse comme 192.168.x.x ou 10.x.x.x
```

### **Tester la connexion** :
```bash
# Remplacez 192.168.1.100 par votre IP
curl http://192.168.1.100:3000/api/health
# Doit retourner: {"status":"OK",...}
```

## 📱 Étape 3: Configurer l'Application

### **Option A: Modifier directement le code**

Éditez `CameraLocApp/src/services/ApiService.ts` ligne 26 :
```typescript
// Remplacez par votre IP locale
private static BASE_URL = 'http://192.168.1.100:3000/api';
```

### **Option B: Configuration dynamique**

Dans votre composant principal (App.tsx), ajoutez :
```typescript
import BackendStorageService from './src/services/BackendStorageService';

// Au démarrage de l'app
useEffect(() => {
  // Remplacez par votre IP locale
  BackendStorageService.configureBackendUrl('192.168.1.100');
}, []);
```

## 🔄 Étape 4: Modifier l'Application pour Utiliser le Backend

### **Remplacer StorageService par BackendStorageService**

Dans vos écrans (AuthScreen, CameraScreen, etc.), remplacez :
```typescript
// Ancien
import { StorageService } from '../services/StorageService';

// Nouveau  
import BackendStorageService from '../services/BackendStorageService';
```

Et dans les appels :
```typescript
// Ancien
await StorageService.savePhoto(photo);

// Nouveau
await BackendStorageService.savePhoto(photo);
```

## 📸 Étape 5: Tester l'Upload de Photos

### **Vérifications** :
1. ✅ **Backend démarré** (`npm run dev` en cours)
2. ✅ **IP configurée** dans ApiService
3. ✅ **Téléphone sur le même WiFi** que votre PC
4. ✅ **App buildée** avec les modifications

### **Test de prise de photo** :
1. Ouvrez l'app sur votre téléphone
2. Créez un compte ou connectez-vous
3. Allez dans l'onglet "Studio Photo"
4. Prenez une vraie photo avec l'appareil
5. Ajoutez un nom de lieu et un objectif
6. Sauvegardez

### **Vérifier l'upload** :
- Les photos apparaissent dans l'app
- Les fichiers sont visibles dans `camera-loc-backend/uploads/`
- L'URL de l'image est accessible : `http://VOTRE_IP:3000/uploads/photo-xxx.jpg`

## 🗄️ Étape 6: Vérifier la Base de Données

```bash
# Dans le dossier backend
ls -la
# Vous devriez voir: database.sqlite

# Optionnel: Examiner la base avec SQLite
sqlite3 database.sqlite
.tables
SELECT * FROM photos;
SELECT * FROM users;
.quit
```

## 🐛 Dépannage

### **Problème : "Erreur de connexion au serveur"**
- ✅ Vérifiez que le backend est démarré
- ✅ Testez l'URL dans le navigateur : `http://VOTRE_IP:3000`
- ✅ Vérifiez que le téléphone est sur le même WiFi

### **Problème : "Network request failed"**
- ✅ Changez `localhost` par votre IP locale
- ✅ Désactivez temporairement le firewall
- ✅ Vérifiez les permissions réseau de l'app

### **Problème : "File upload failed"**
- ✅ Vérifiez que le dossier `uploads/` existe
- ✅ Contrôlez la taille de la photo (max 10MB)
- ✅ Assurez-vous que l'app a les permissions caméra

### **Problème : "Photos ne s'affichent pas"**
- ✅ Vérifiez l'URL complète de l'image
- ✅ Testez l'accès direct : `http://VOTRE_IP:3000/uploads/photo-xxx.jpg`
- ✅ Contrôlez les paramètres CORS

## 🎯 Tests Recommandés

1. **Authentification** :
   - Créer un compte
   - Se connecter/déconnecter
   - Données persistées

2. **Photos** :
   - Prendre photo avec appareil
   - Voir la photo dans galerie
   - Supprimer une photo
   - Photos avec géolocalisation

3. **Lieux** :
   - Créer lieu avec objectif
   - Ajouter photos à lieu existant
   - Voir progression des objectifs

4. **Hors-ligne** :
   - Arrêter le backend
   - Vérifier gestion d'erreur
   - Redémarrer et synchroniser

## 📊 API Endpoints Disponibles

Testez directement avec curl ou Postman :

```bash
# Santé du serveur
curl http://VOTRE_IP:3000/api/health

# Créer un compte
curl -X POST http://VOTRE_IP:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'

# Se connecter
curl -X POST http://VOTRE_IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## 🚀 Prochaines Étapes

Une fois les tests validés :
1. **Sécuriser** l'API (JWT, hash passwords)
2. **Déployer** sur un serveur (Heroku, DigitalOcean)
3. **Ajouter** synchronisation offline
4. **Optimiser** compression d'images
5. **Implémenter** backup cloud

---

**Votre application peut maintenant traiter de vraies photos prises avec l'appareil du téléphone ! 📸**
