import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulation des services
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
}

// Écran de simulation photo
const CameraSimulator = ({ onPhotoTaken }) => {
  const [loading, setLoading] = useState(false);

  const simulatePhoto = () => {
    setLoading(true);
    // Simulation d'une prise de photo
    setTimeout(() => {
      const photo = {
        id: Date.now().toString(),
        uri: `https://picsum.photos/400/300?random=${Date.now()}`,
        latitude: 48.8566 + (Math.random() - 0.5) * 0.02,
        longitude: 2.3522 + (Math.random() - 0.5) * 0.02,
        timestamp: new Date().toISOString(),
      };
      setLoading(false);
      onPhotoTaken(photo);
    }, 1000);
  };

  return (
    <View style={styles.center}>
      <TouchableOpacity
        style={[styles.cameraButton, loading && styles.disabled]}
        onPress={simulatePhoto}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonIcon}>📸</Text>
            <Text style={styles.buttonText}>Simuler une photo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Écran principal
export default function App() {
  const [currentTab, setCurrentTab] = useState('camera');
  const [photos, setPhotos] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const photosData = await StorageService.getPhotos();
    const locationsData = await StorageService.getLocations();
    setPhotos(photosData);
    setLocations(locationsData);
  };

  const onPhotoTaken = (photo) => {
    setCurrentPhoto(photo);
    setShowModal(true);
  };

  const savePhoto = async () => {
    if (!currentPhoto) return;

    const photoWithLocation = {
      ...currentPhoto,
      locationName: locationName.trim() || 'Sans nom',
    };

    await StorageService.savePhoto(photoWithLocation);

    if (locationName.trim()) {
      const location = {
        id: Date.now().toString(),
        name: locationName.trim(),
        latitude: currentPhoto.latitude,
        longitude: currentPhoto.longitude,
        visitGoal: 5,
        currentVisits: 1,
        photos: [photoWithLocation],
      };
      await StorageService.saveLocation(location);
    }

    setShowModal(false);
    setLocationName('');
    setCurrentPhoto(null);
    loadData();
    Alert.alert('Succès', 'Photo sauvegardée !');
  };

  const renderCamera = () => (
    <View style={styles.screen}>
      <Text style={styles.title}>📷 Caméra</Text>
      <CameraSimulator onPhotoTaken={onPhotoTaken} />
      <View style={styles.photosGrid}>
        {photos.slice(-4).map((photo) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoThumb}
            onPress={() => setSelectedPhoto(photo)}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumbImage} />
            <Text style={styles.thumbText}>
              {photo.locationName || 'Sans nom'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMap = () => (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>🗺️ Carte</Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Vue Carte Simulée</Text>
        <Text style={styles.mapSubtext}>
          {photos.length} photos • {locations.length} lieux
        </Text>
      </View>
      {locations.map((location) => (
        <View key={location.id} style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 {location.name}</Text>
          <Text style={styles.cardText}>
            {location.currentVisits}/{location.visitGoal} visites
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(location.currentVisits / location.visitGoal) * 100}%` }
              ]} 
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCalendar = () => (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>📅 Calendrier</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{photos.length}</Text>
          <Text style={styles.statLabel}>Total Photos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{locations.length}</Text>
          <Text style={styles.statLabel}>Lieux Visités</Text>
        </View>
      </View>
      {photos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.photoItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
          <View style={styles.photoInfo}>
            <Text style={styles.photoTitle}>
              {photo.locationName || 'Photo sans nom'}
            </Text>
            <Text style={styles.photoDate}>
              {new Date(photo.timestamp).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Contenu principal */}
      {currentTab === 'camera' && renderCamera()}
      {currentTab === 'map' && renderMap()}
      {currentTab === 'calendar' && renderCalendar()}

      {/* Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'camera' && styles.activeTab]}
          onPress={() => setCurrentTab('camera')}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={styles.tabLabel}>Caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'map' && styles.activeTab]}
          onPress={() => setCurrentTab('map')}
        >
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text style={styles.tabLabel}>Carte</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'calendar' && styles.activeTab]}
          onPress={() => setCurrentTab('calendar')}
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={styles.tabLabel}>Calendrier</Text>
        </TouchableOpacity>
      </View>

      {/* Modal pour nommer la photo */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nommer le lieu</Text>
            {currentPhoto && (
              <Image source={{ uri: currentPhoto.uri }} style={styles.previewImage} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Nom du lieu"
              value={locationName}
              onChangeText={setLocationName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal pour voir les détails d'une photo */}
      <Modal visible={!!selectedPhoto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Text style={styles.modalTitle}>📷 Détails</Text>
                <Image source={{ uri: selectedPhoto.uri }} style={styles.previewImage} />
                <Text style={styles.detailText}>
                  📍 {selectedPhoto.locationName || 'Sans nom'}
                </Text>
                <Text style={styles.detailText}>
                  📅 {new Date(selectedPhoto.timestamp).toLocaleString('fr-FR')}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedPhoto(null)}
                >
                  <Text style={styles.buttonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  screen: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  photoThumb: {
    width: '48%',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  thumbText: {
    padding: 8,
    fontSize: 12,
    color: '#7f8c8d',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e8f4fd',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 20,
    color: '#3498db',
    fontWeight: 'bold',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  photoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  photoInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  photoDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 10,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
    textAlign: 'center',
  },
});
