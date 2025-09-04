import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Services (identiques)
class StorageService {
  static async savePhoto(photo) {
    try {
      const photos = await this.getPhotos();
      photos.push(photo);
      await AsyncStorage.setItem('@photos', JSON.stringify(photos));
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  }

  static async getPhotos() {
    try {
      const data = await AsyncStorage.getItem('@photos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  static async saveLocation(location) {
    try {
      const locations = await this.getLocations();
      locations.push(location);
      await AsyncStorage.setItem('@locations', JSON.stringify(locations));
    } catch (error) {
      console.error('Erreur sauvegarde lieu:', error);
    }
  }

  static async getLocations() {
    try {
      const data = await AsyncStorage.getItem('@locations');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  static async deletePhoto(photoId) {
    try {
      const photos = await this.getPhotos();
      const filteredPhotos = photos.filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem('@photos', JSON.stringify(filteredPhotos));
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      throw error;
    }
  }

  static async saveUser(user) {
    try {
      await AsyncStorage.setItem('@currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Erreur sauvegarde utilisateur:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const data = await AsyncStorage.getItem('@currentUser');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  }

  static async getAllUsers() {
    try {
      const data = await AsyncStorage.getItem('@users');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  static async registerUser(email, password, name) {
    try {
      const users = await this.getAllUsers();
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        throw new Error('Un compte existe déjà avec cet email');
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // En production, il faudrait hasher le mot de passe
        name,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('@users', JSON.stringify(users));
      
      // Connecter automatiquement l'utilisateur
      await this.saveUser(newUser);
      
      return newUser;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  }

  static async loginUser(email, password) {
    try {
      const users = await this.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      await this.saveUser(user);
      return user;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  }

  static async logout() {
    try {
      await AsyncStorage.removeItem('@currentUser');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (updates.email) {
        const existingUser = users.find(user => user.email === updates.email && user.id !== userId);
        if (existingUser) {
          throw new Error('Cet email est déjà utilisé par un autre compte');
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;
      await AsyncStorage.setItem('@users', JSON.stringify(users));
      
      // Mettre à jour l'utilisateur connecté
      await this.saveUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }
}

// Composant de bouton moderne avec animation
const ModernButton = ({ onPress, children, style, variant = 'primary', loading = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.modernButton,
          variant === 'primary' && styles.primaryButton,
          variant === 'secondary' && styles.secondaryButton,
          variant === 'accent' && styles.accentButton,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant carte moderne avec gradient
const ModernCard = ({ children, style }) => {
  return (
    <View style={[styles.modernCard, style]}>
      {children}
    </View>
  );
};

// Écran de simulation photo amélioré
const CameraSimulator = ({ onPhotoTaken }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulse).start();
  }, []);

  // Obtenir la position actuelle avec Expo Location
  const getCurrentLocation = async () => {
    try {
      // Demander les permissions de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 60000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      throw new Error(`Erreur géolocalisation: ${error.message}`);
    }
  };

  const takeRealPhoto = async () => {
    setLoading(true);
    setLocationError(null);
    
    try {
      // Obtenir la vraie position GPS d'abord
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      
      // Vérifier si ImagePicker est disponible
      if (!ImagePicker || !ImagePicker.requestCameraPermissionsAsync) {
        throw new Error('ImagePicker non disponible dans cette version d\'Expo');
      }
      
      // Demander les permissions de caméra
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'application a besoin d\'accéder à votre caméra pour prendre des photos.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }
      
      // Prendre une vraie photo avec l'appareil
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        const photo = {
          id: Date.now().toString(),
          uri: asset.uri,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
          timestamp: new Date().toISOString(),
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
        };
        
        setLoading(false);
        onPhotoTaken(photo);
      } else {
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Erreur prise de photo:', error);
      setLoading(false);
      
      // Message d'erreur plus spécifique
      Alert.alert(
        'Erreur Caméra',
        `Erreur: ${error.message || 'Impossible d\'accéder à la caméra'}. Vérifiez que l\'application a bien les permissions caméra.`,
        [{ text: 'OK' }]
      );
    }
  };


  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraViewfinder}>
        <Animated.View style={[styles.cameraFrame, { transform: [{ scale: pulseAnim }] }]}>
          <ModernButton
            onPress={takeRealPhoto}
            variant="accent"
            loading={loading}
            style={styles.captureButton}
          >
            <Text style={styles.captureButtonText}>
              {loading ? '📸' : '📷'}
            </Text>
            <Text style={styles.captureButtonLabel}>
              {loading ? 'Capture...' : 'Prendre Photo'}
            </Text>
          </ModernButton>
        </Animated.View>
      </View>
      
    </View>
  );
};

// Composant d'écran d'authentification
const AuthScreen = ({ onLogin, onRegister, authMode, setAuthMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(email, password, name);
      }
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      // Erreur gérée dans les fonctions parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.authContainer} contentContainerStyle={styles.authContent}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" translucent={false} />
      
      <View style={styles.authHeader}>
        <Text style={styles.authTitle}>
          {authMode === 'login' ? '👋 Bon retour !' : '✨ Créons votre compte'}
        </Text>
        <Text style={styles.authSubtitle}>
          {authMode === 'login' 
            ? 'Connectez-vous pour retrouver vos souvenirs' 
            : 'Rejoignez-nous pour capturer vos moments'
          }
        </Text>
      </View>

      <View style={styles.authForm}>
        {authMode === 'register' && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>👤 Nom complet</Text>
            <TextInput
              style={styles.authInput}
              placeholder="Ex: Marie Dubois"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📧 Email</Text>
          <TextInput
            style={styles.authInput}
            placeholder="votre.email@exemple.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🔒 Mot de passe</Text>
          <TextInput
            style={styles.authInput}
            placeholder="Votre mot de passe"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.authButton, loading && styles.authButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.authButtonText}>
              {authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authSwitchButton}
          onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        >
          <Text style={styles.authSwitchText}>
            {authMode === 'login' 
              ? 'Pas encore de compte ? Créer un compte' 
              : 'Déjà un compte ? Se connecter'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Application principale avec design moderne
export default function App() {
  const [currentTab, setCurrentTab] = useState('camera');
  const [photos, setPhotos] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [visitGoal, setVisitGoal] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedExistingLocation, setSelectedExistingLocation] = useState(null);
  const [isCreatingNewLocation, setIsCreatingNewLocation] = useState(true);
  
  // États d'authentification
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' ou 'register'
  
  // États pour la page profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Vérifier si un utilisateur est déjà connecté
      const user = await StorageService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        loadData();
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
    } finally {
      setIsLoading(false);
      
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const loadData = async () => {
    const photosData = await StorageService.getPhotos();
    const locationsData = await StorageService.getLocations();
    setPhotos(photosData);
    setLocations(locationsData);
  };

  const initializeProfileEdit = () => {
    setEditName(currentUser?.name || '');
    setEditEmail(currentUser?.email || '');
    setEditPassword('');
    setEditConfirmPassword('');
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editPassword && editPassword !== editConfirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await StorageService.updateUserProfile(currentUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        password: editPassword || undefined
      });
      
      setCurrentUser({
        ...currentUser,
        name: editName.trim(),
        email: editEmail.trim()
      });
      
      setIsEditingProfile(false);
      setEditPassword('');
      setEditConfirmPassword('');
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const onPhotoTaken = (photo) => {
    setCurrentPhoto(photo);
    setShowPreviewModal(true);
  };

  const validatePhoto = () => {
    setShowPreviewModal(false);
    setShowModal(true);
  };

  const retakePhoto = () => {
    setShowPreviewModal(false);
    setCurrentPhoto(null);
  };

  const goBackToPreview = () => {
    setShowModal(false);
    setShowPreviewModal(true);
  };

  const handleLogin = async (email, password) => {
    try {
      const user = await StorageService.loginUser(email, password);
      setCurrentUser(user);
      loadData();
      Alert.alert('Connexion réussie', `Bienvenue ${user.name} !`);
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const user = await StorageService.registerUser(email, password, name);
      setCurrentUser(user);
      loadData();
      Alert.alert('Compte créé', `Bienvenue ${user.name} !`);
    } catch (error) {
      Alert.alert('Erreur d\'inscription', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '🚪 Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.logout();
              setCurrentUser(null);
              setPhotos([]);
              setLocations([]);
              Alert.alert('À bientôt', 'Vous avez été déconnecté avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            }
          },
        },
      ]
    );
  };

  const deletePhoto = async (photoId) => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deletePhoto(photoId);
              loadData();
              setSelectedPhoto(null);
              Alert.alert('Supprimé', 'Photo supprimée avec succès');
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la photo');
            }
          },
        },
      ]
    );
  };

  const savePhoto = async () => {
    if (!currentPhoto) return;

    let finalLocationName = '';
    
    if (isCreatingNewLocation) {
      finalLocationName = locationName.trim() || 'Lieu inconnu';
    } else {
      finalLocationName = selectedExistingLocation?.name || 'Lieu inconnu';
    }

    const photoWithLocation = {
      ...currentPhoto,
      locationName: finalLocationName,
    };

    await StorageService.savePhoto(photoWithLocation);

    if (isCreatingNewLocation && locationName.trim()) {
      // Créer un nouveau lieu
      const location = {
        id: Date.now().toString(),
        name: locationName.trim(),
        latitude: currentPhoto.latitude,
        longitude: currentPhoto.longitude,
        visitGoal: visitGoal ? parseInt(visitGoal) : 0,
        currentVisits: 1,
        photos: [photoWithLocation],
      };
      await StorageService.saveLocation(location);
    } else if (!isCreatingNewLocation && selectedExistingLocation) {
      // Ajouter à un lieu existant
      const existingLocations = await StorageService.getLocations();
      const locationIndex = existingLocations.findIndex(loc => loc.id === selectedExistingLocation.id);
      
      if (locationIndex >= 0) {
        const location = existingLocations[locationIndex];
        const now = new Date();
        const weekStart = getWeekStart(now);
        
        // Vérifier si on est dans une nouvelle semaine
        if (location.weekStartDate && new Date(location.weekStartDate).getTime() !== weekStart.getTime()) {
          location.weekStartDate = weekStart;
          location.currentVisits = 0;
        }
        
        // Ajouter la visite
        location.currentVisits += 1;
        location.photos.push(photoWithLocation);
        
        // Sauvegarder le lieu modifié
        existingLocations[locationIndex] = location;
        await AsyncStorage.setItem('@locations', JSON.stringify(existingLocations));
      }
    }

    setShowModal(false);
    setLocationName('');
    setVisitGoal('');
    setSelectedExistingLocation(null);
    setIsCreatingNewLocation(true);
    setCurrentPhoto(null);
    loadData();
    Alert.alert('Succès', 'Photo sauvegardée !');
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const renderCamera = () => (
    <Animated.View 
      style={[
        styles.screen, 
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.modernHeader}>
        <Text style={styles.modernTitle}>Studio Photo</Text>
        <Text style={styles.modernSubtitle}>Capturez vos moments magiques</Text>
      </View>
      
      <CameraSimulator onPhotoTaken={onPhotoTaken} />
      
      <View style={styles.gallerySection}>
        <Text style={styles.sectionTitle}>✨ Galerie Récente</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {photos.slice(-6).map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              style={[styles.modernPhotoThumb, { marginLeft: index === 0 ? 0 : 15 }]}
              onPress={() => setSelectedPhoto(photo)}
            >
              <Image source={{ uri: photo.uri }} style={styles.modernThumbImage} />
              <View style={styles.thumbOverlay}>
                <Text style={styles.thumbLocation}>
                  {photo.locationName || 'Sans nom'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );

  const renderMap = () => {
    // Calculer la région de la carte basée sur les photos
    const getMapRegion = () => {
      if (photos.length === 0) {
        // Région par défaut (Paris)
        return {
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }

      const latitudes = photos.map(p => p.latitude).filter(lat => lat != null);
      const longitudes = photos.map(p => p.longitude).filter(lng => lng != null);
      
      if (latitudes.length === 0) {
        return {
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
      }

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = Math.max(maxLat - minLat, 0.01) * 1.2;
      const deltaLng = Math.max(maxLng - minLng, 0.01) * 1.2;

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: deltaLat,
        longitudeDelta: deltaLng,
      };
    };

    return (
      <View style={styles.screen}>
        <View style={styles.modernHeader}>
          <Text style={styles.modernTitle}>Exploration</Text>
          <Text style={styles.modernSubtitle}>Vos aventures cartographiées</Text>
        </View>
        
        {/* Vraie carte interactive */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={getMapRegion()}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            showsScale={true}
            mapType="standard"
          >
            {/* Marqueurs pour chaque photo */}
            {photos.map((photo, index) => {
              if (!photo.latitude || !photo.longitude) return null;
              
              return (
                <Marker
                  key={photo.id}
                  coordinate={{
                    latitude: photo.latitude,
                    longitude: photo.longitude,
                  }}
                  title={photo.locationName || 'Lieu inconnu'}
                  description={`${new Date(photo.timestamp).toLocaleDateString('fr-FR')} • ${photo.locationName || 'Sans nom'}`}
                >
                  <View style={styles.customMarker}>
                    <Image source={{ uri: photo.uri }} style={styles.markerImage} />
                    <View style={styles.markerBadge}>
                      <Text style={styles.markerBadgeText}>{index + 1}</Text>
                    </View>
                  </View>
                  <Callout style={styles.callout}>
                    <View style={styles.calloutContent}>
                      <Image source={{ uri: photo.uri }} style={styles.calloutImage} />
                      <Text style={styles.calloutTitle}>{photo.locationName || 'Lieu inconnu'}</Text>
                      <Text style={styles.calloutDate}>
                        {new Date(photo.timestamp).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {photo.visitGoal > 0 && (
                        <Text style={styles.calloutGoal}>
                          Objectif: {photo.currentVisits}/{photo.visitGoal} visites/semaine
                        </Text>
                      )}
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>
        
        {/* Section des défis en bas */}
        <ScrollView style={styles.challengesSection} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Vos Défis</Text>
          {locations.filter(location => location.visitGoal > 0).length === 0 ? (
            <ModernCard style={{ marginBottom: 15 }}>
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateIcon}>•</Text>
                <Text style={styles.emptyStateTitle}>Aucun défi actif</Text>
                <Text style={styles.emptyStateText}>
                  Créez un objectif de visites lors de votre prochaine photo pour suivre vos habitudes !
                </Text>
              </View>
            </ModernCard>
          ) : (
            locations.filter(location => location.visitGoal > 0).map((location, index) => (
            <ModernCard key={location.id} style={{ marginBottom: 15 }}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>
                    {location.visitGoal > 0 
                      ? `${Math.round((location.currentVisits / location.visitGoal) * 100)}%`
                      : '∞'
                    }
                  </Text>
                </View>
              </View>
              
              <Text style={styles.locationSubtext}>
                {location.visitGoal > 0 
                  ? `${location.currentVisits}/${location.visitGoal} visites cette semaine`
                  : `${location.currentVisits} visite${location.currentVisits > 1 ? 's' : ''} - Pas d'objectif`
                }
              </Text>
              
              {location.visitGoal > 0 && (
                <View style={styles.modernProgressBar}>
                  <View 
                    style={[
                      styles.modernProgressFill, 
                      { width: `${Math.min((location.currentVisits / location.visitGoal) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              )}
            </ModernCard>
          ))
          )}
        </ScrollView>
      </View>
    );
  };

  const renderCalendar = () => (
    <ScrollView style={styles.screen}>
      <View style={styles.modernHeader}>
        <Text style={styles.modernTitle}>Timeline</Text>
        <Text style={styles.modernSubtitle}>Vos souvenirs organisés</Text>
      </View>
      
      <View style={styles.modernStatsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{photos.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
          <Text style={styles.statIcon}>📸</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{locations.length}</Text>
          <Text style={styles.statLabel}>Lieux</Text>
          <Text style={styles.statIcon}>📍</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {locations.filter(loc => loc.visitGoal > 0 && loc.currentVisits >= loc.visitGoal).length}
          </Text>
          <Text style={styles.statLabel}>Objectifs Atteints</Text>
          <Text style={styles.statIcon}>🎯</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Journal</Text>
      {photos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.modernPhotoItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.uri }} style={styles.modernPhotoThumb} />
          <View style={styles.modernPhotoInfo}>
            <Text style={styles.modernPhotoTitle}>
              {photo.locationName || 'Moment capturé'}
            </Text>
            <Text style={styles.modernPhotoDate}>
              {new Date(photo.timestamp).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <Text style={styles.modernPhotoTime}>
              {new Date(photo.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.photoArrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderProfile = () => {

    return (
      <ScrollView style={styles.screen}>
        <View style={styles.modernHeader}>
          <Text style={styles.modernTitle}>Profil</Text>
          <Text style={styles.modernSubtitle}>Gérez vos informations personnelles</Text>
        </View>

        <ModernCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{currentUser?.name || 'Utilisateur'}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || 'email@example.com'}</Text>
            </View>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>{photos.length}</Text>
              <Text style={styles.profileStatLabel}>Photos</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>{locations.length}</Text>
              <Text style={styles.profileStatLabel}>Lieux</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>
                {locations.filter(loc => loc.visitGoal > 0 && loc.currentVisits >= loc.visitGoal).length}
              </Text>
              <Text style={styles.profileStatLabel}>Objectifs</Text>
            </View>
          </View>
        </ModernCard>

        <ModernCard style={styles.profileDetailsCard}>
          <View style={styles.profileDetailsHeader}>
            <Text style={styles.profileDetailsTitle}>Informations personnelles</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (!isEditingProfile) {
                  initializeProfileEdit();
                }
                setIsEditingProfile(!isEditingProfile);
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditingProfile ? 'Annuler' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingProfile ? (
            <View style={styles.profileEditForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet</Text>
                <TextInput
                  style={styles.modernInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Votre nom complet"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.modernInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Votre adresse email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nouveau mot de passe (optionnel)</Text>
                <TextInput
                  style={styles.modernInput}
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="Laissez vide pour ne pas changer"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              {editPassword ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                  <TextInput
                    style={styles.modernInput}
                    value={editConfirmPassword}
                    onChangeText={setEditConfirmPassword}
                    placeholder="Confirmez le nouveau mot de passe"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.modernButton, styles.primaryButton, { marginTop: 20 }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.primaryButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileDetailsContent}>
              <View style={styles.profileDetailItem}>
                <Text style={styles.profileDetailLabel}>Nom complet</Text>
                <Text style={styles.profileDetailValue}>{currentUser?.name || 'Non renseigné'}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Text style={styles.profileDetailLabel}>Email</Text>
                <Text style={styles.profileDetailValue}>{currentUser?.email || 'Non renseigné'}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <Text style={styles.profileDetailLabel}>Membre depuis</Text>
                <Text style={styles.profileDetailValue}>
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('fr-FR') : 'Inconnu'}
                </Text>
              </View>
            </View>
          )}
        </ModernCard>

        <ModernCard style={styles.profileActionsCard}>
          <Text style={styles.profileActionsTitle}>Actions</Text>
          
          <TouchableOpacity
            style={styles.profileActionButton}
            onPress={handleLogout}
          >
            <Text style={styles.profileActionButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ModernCard>
      </ScrollView>
    );
  };

  // Écran de chargement
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Écran d'authentification si pas d'utilisateur connecté
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" translucent={false} />
      
      {/* Header avec utilisateur et déconnexion */}
      <View style={styles.userHeader}>
        <Text style={styles.welcomeText}>👋 Salut {currentUser.name}!</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>🚪 Déconnexion</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenu principal */}
      {currentTab === 'camera' && renderCamera()}
      {currentTab === 'map' && renderMap()}
      {currentTab === 'calendar' && renderCalendar()}
      {currentTab === 'profile' && renderProfile()}

      {/* Navigation moderne */}
      <View style={styles.modernTabBar}>
        <TouchableOpacity
          style={[styles.modernTab, currentTab === 'camera' && styles.activeModernTab]}
          onPress={() => setCurrentTab('camera')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.modernTabIcon, currentTab === 'camera' && styles.activeTabIcon]}>
              📷
            </Text>
            <Text style={[styles.modernTabLabel, currentTab === 'camera' && styles.activeTabLabel]}>
              Studio
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modernTab, currentTab === 'map' && styles.activeModernTab]}
          onPress={() => setCurrentTab('map')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.modernTabIcon, currentTab === 'map' && styles.activeTabIcon]}>
              🗺️
            </Text>
            <Text style={[styles.modernTabLabel, currentTab === 'map' && styles.activeTabLabel]}>
              Explorer
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modernTab, currentTab === 'calendar' && styles.activeModernTab]}
          onPress={() => setCurrentTab('calendar')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.modernTabIcon, currentTab === 'calendar' && styles.activeTabIcon]}>
              📅
            </Text>
            <Text style={[styles.modernTabLabel, currentTab === 'calendar' && styles.activeTabLabel]}>
              Journal
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modernTab, currentTab === 'profile' && styles.activeModernTab]}
          onPress={() => setCurrentTab('profile')}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.modernTabIcon, currentTab === 'profile' && styles.activeTabIcon]}>
              👤
            </Text>
            <Text style={[styles.modernTabLabel, currentTab === 'profile' && styles.activeTabLabel]}>
              Profil
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal moderne pour nommer la photo */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modernModalTitle}>Nice pic!</Text>
              <Text style={styles.modalSubtitle}>Donnez un nom à ce lieu</Text>
            </View>
            
            {currentPhoto && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: currentPhoto.uri }} style={styles.modernPreviewImage} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.overlayText}>Nouveau lieu</Text>
                </View>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              {/* Choix entre nouveau lieu ou lieu existant */}
              <View style={styles.locationChoiceContainer}>
                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    isCreatingNewLocation && styles.activeChoiceButton
                  ]}
                  onPress={() => {
                    setIsCreatingNewLocation(true);
                    setSelectedExistingLocation(null);
                  }}
                >
                  <Text style={[
                    styles.choiceButtonText,
                    isCreatingNewLocation && styles.activeChoiceButtonText
                  ]}>
                    ✨ Nouveau lieu
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.choiceButton,
                    !isCreatingNewLocation && styles.activeChoiceButton
                  ]}
                  onPress={() => {
                    setIsCreatingNewLocation(false);
                    setLocationName('');
                    setVisitGoal('');
                  }}
                >
                  <Text style={[
                    styles.choiceButtonText,
                    !isCreatingNewLocation && styles.activeChoiceButtonText
                  ]}>
                    Lieu existant
                  </Text>
                </TouchableOpacity>
              </View>

              {isCreatingNewLocation ? (
                // Interface pour créer un nouveau lieu
                <>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Ex: Café de Montmartre, Parc des Buttes..."
                    placeholderTextColor="#999"
                    value={locationName}
                    onChangeText={setLocationName}
                  />
                  
                  {locationName.trim() && (
                    <>
                      <Text style={styles.inputLabel}>Objectif de visites par semaine (optionnel)</Text>
                      <TextInput
                        style={[styles.modernInput, { marginTop: 10 }]}
                        placeholder="Ex: 3 visites par semaine (laisser vide = pas d'objectif)"
                        placeholderTextColor="#999"
                        value={visitGoal}
                        onChangeText={setVisitGoal}
                        keyboardType="numeric"
                      />
                    </>
                  )}
                </>
              ) : (
                // Interface pour sélectionner un lieu existant
                <View style={styles.existingLocationsContainer}>
                  <Text style={styles.inputLabel}>Choisissez un lieu existant</Text>
                  <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
                    {locations.map((location) => (
                      <TouchableOpacity
                        key={location.id}
                        style={[
                          styles.locationOption,
                          selectedExistingLocation?.id === location.id && styles.selectedLocationOption
                        ]}
                        onPress={() => setSelectedExistingLocation(location)}
                      >
                        <View style={styles.locationOptionContent}>
                          <Text style={[
                            styles.locationOptionName,
                            selectedExistingLocation?.id === location.id && styles.selectedLocationOptionText
                          ]}>
                            {location.name}
                          </Text>
                          <Text style={[
                            styles.locationOptionStats,
                            selectedExistingLocation?.id === location.id && styles.selectedLocationOptionText
                          ]}>
                            {location.visitGoal > 0 
                              ? `${location.currentVisits}/${location.visitGoal} visites`
                              : `${location.currentVisits} visite${location.currentVisits > 1 ? 's' : ''}`
                            }
                          </Text>
                        </View>
                        {location.visitGoal > 0 && (
                          <View style={styles.miniProgressBadge}>
                            <Text style={styles.miniProgressText}>
                              {Math.round((location.currentVisits / location.visitGoal) * 100)}%
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  {locations.length === 0 && (
                    <View style={styles.noLocationsMessage}>
                      <Text style={styles.noLocationsText}>
                        Aucun lieu créé pour le moment.
                      </Text>
                      <Text style={styles.noLocationsSubtext}>
                        Créez d'abord un nouveau lieu !
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            <View style={styles.modernModalButtons}>
              <TouchableOpacity
                style={[styles.modernButton, styles.secondaryButton, { flex: 1, marginRight: 10 }]}
                onPress={goBackToPreview}
              >
                <Text style={styles.secondaryButtonText}>Retour</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modernButton, 
                  styles.primaryButton, 
                  { 
                    flex: 1, 
                    marginLeft: 10,
                    opacity: (isCreatingNewLocation && !locationName.trim()) || (!isCreatingNewLocation && !selectedExistingLocation) ? 0.5 : 1
                  }
                ]}
                onPress={savePhoto}
                disabled={(isCreatingNewLocation && !locationName.trim()) || (!isCreatingNewLocation && !selectedExistingLocation)}
              >
                <Text style={styles.primaryButtonText}>💾 Sauvegardé</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de prévisualisation avec boutons Valider/Refaire */}
      <Modal visible={showPreviewModal} transparent animationType="slide">
        <View style={styles.modernModalOverlay}>
          <View style={styles.previewModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modernModalTitle}>Prévisualisation</Text>
              <Text style={styles.modernModalSubtitle}>Votre photo est-elle réussie ?</Text>
            </View>
            
            {currentPhoto && (
              <View style={styles.previewImageContainer}>
                <Image source={{ uri: currentPhoto.uri }} style={styles.previewImage} />
                <View style={styles.previewImageOverlay}>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationInfoText}>
                      Position GPS capturée
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[styles.modernButton, styles.secondaryButton, { flex: 1, marginRight: 10 }]}
                onPress={retakePhoto}
              >
                <Text style={styles.secondaryButtonText}>Refaire</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernButton, styles.primaryButton, { flex: 1, marginLeft: 10 }]}
                onPress={validatePhoto}
              >
                <Text style={styles.primaryButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal moderne pour voir les détails d'une photo */}
      <Modal visible={!!selectedPhoto} transparent animationType="slide">
        <View style={styles.modernModalOverlay}>
          <View style={styles.modernModalContent}>
            {selectedPhoto && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modernModalTitle}>Souvenir</Text>
                </View>
                
                <Image source={{ uri: selectedPhoto.uri }} style={styles.modernPreviewImage} />
                
                <View style={styles.detailsContainer}>
                  <Text style={styles.modernDetailTitle}>
                    {selectedPhoto.locationName || 'Lieu inconnu'}
                  </Text>
                  <Text style={styles.modernDetailDate}>
                    {new Date(selectedPhoto.timestamp).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.modernDetailTime}>
                    ⏰ {new Date(selectedPhoto.timestamp).toLocaleTimeString('fr-FR')}
                  </Text>
                </View>
                
                <View style={styles.photoDetailButtons}>
                  <ModernButton
                    variant="secondary"
                    onPress={() => deletePhoto(selectedPhoto.id)}
                    style={{ flex: 1, marginRight: 10 }}
                  >
                    <Text style={styles.secondaryButtonText}>Supprimer</Text>
                  </ModernButton>
                  
                  <ModernButton
                    variant="primary"
                    onPress={() => setSelectedPhoto(null)}
                    style={{ flex: 1, marginLeft: 10 }}
                  >
                    <Text style={styles.primaryButtonText}>✨ Fermer</Text>
                  </ModernButton>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles d'authentification
  authContainer: {
    flex: 1,
    backgroundColor: '#6C63FF',
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  authForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  authInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
  },
  authButton: {
    backgroundColor: '#4C51BF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  authSwitchButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  authSwitchText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Styles pour l'écran de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Header utilisateur
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40, // Ajout d'espace pour éviter la StatusBar
    backgroundColor: '#5A52FF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  
  // Headers modernes
  modernHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Boutons modernes
  modernButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: '#4C51BF',
  },
  secondaryButton: {
    backgroundColor: '#CBD5E0',
    borderWidth: 1,
    borderColor: '#A0AEC0',
  },
  accentButton: {
    backgroundColor: '#ED64A6',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  secondaryButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  
  // Cartes modernes
  modernCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  
  // Section caméra
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraViewfinder: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    borderWidth: 3,
    borderColor: '#6C63FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cameraFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonText: {
    fontSize: 32,
    marginBottom: 5,
  },
  captureButtonLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Galerie
  gallerySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
  },
  modernPhotoThumb: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernThumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  thumbLocation: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Carte interactive
  mapContainer: {
    height: 300,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  challengesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Marqueurs personnalisés
  customMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Callout (bulle d'information)
  callout: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  calloutContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  calloutImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  calloutGoal: {
    fontSize: 12,
    color: '#6C63FF',
    fontWeight: '600',
  },
  
  // Localisation
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
  },
  progressBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  locationSubtext: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 15,
  },
  modernProgressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modernProgressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  
  // Stats
  modernStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  
  // Photos items
  modernPhotoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modernPhotoThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
    resizeMode: 'cover',
  },
  modernPhotoInfo: {
    flex: 1,
  },
  modernPhotoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  modernPhotoDate: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 2,
  },
  modernPhotoTime: {
    fontSize: 12,
    color: '#718096',
  },
  photoArrow: {
    padding: 8,
  },
  arrowText: {
    fontSize: 18,
    color: '#6C63FF',
    fontWeight: '700',
  },
  
  // Navigation moderne
  modernTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modernTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  activeModernTab: {
    backgroundColor: '#F0F4FF',
  },
  tabContent: {
    alignItems: 'center',
  },
  modernTabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeTabIcon: {
    transform: [{ scale: 1.2 }],
  },
  modernTabLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  activeTabLabel: {
    color: '#6C63FF',
    fontWeight: '700',
  },
  
  // Modals modernes
  modernModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 55, 72, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modernModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  previewModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  previewImageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
  },
  previewImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
  },
  locationInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  locationInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4C4C4C',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoDetailButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  
  // État vide pour les défis
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modernModalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 8,
  },
  modernModalSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  modernPreviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 24,
  },
  modernInput: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#2D3748',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginTop: 16,
    marginBottom: 8,
  },
  
  // Choix de lieu
  locationChoiceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 4,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeChoiceButton: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  activeChoiceButtonText: {
    color: '#fff',
  },
  
  // Liste des lieux existants
  existingLocationsContainer: {
    marginTop: 10,
  },
  locationsList: {
    maxHeight: 200,
    marginTop: 10,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLocationOption: {
    backgroundColor: '#E8F4FD',
    borderColor: '#6C63FF',
  },
  locationOptionContent: {
    flex: 1,
  },
  locationOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  selectedLocationOptionText: {
    color: '#6C63FF',
  },
  locationOptionStats: {
    fontSize: 12,
    color: '#718096',
  },
  miniProgressBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniProgressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  noLocationsMessage: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noLocationsText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
    marginBottom: 8,
  },
  noLocationsSubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  modernModalButtons: {
    flexDirection: 'row',
  },
  detailsContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  modernDetailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  modernDetailDate: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  modernDetailTime: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
  
  // Styles de profil
  profileCard: {
    marginBottom: 20,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#718096',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
  profileDetailsCard: {
    marginBottom: 20,
    padding: 20,
  },
  profileDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileEditForm: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  profileDetailsContent: {
    marginTop: 10,
  },
  profileDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileDetailLabel: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  profileDetailValue: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  profileActionsCard: {
    marginBottom: 20,
    padding: 20,
  },
  profileActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 15,
  },
  profileActionButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
