import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import { Photo, Location } from '../types';
import { StorageService } from '../services/StorageService';

const CameraScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [visitGoal, setVisitGoal] = useState('5');
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    loadRecentPhotos();
  }, []);

  const loadRecentPhotos = async () => {
    try {
      const photos = await StorageService.getPhotos();
      // Afficher les 6 dernières photos
      setRecentPhotos(photos.slice(-6).reverse());
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
    }
  };

  const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      );
    });
  };

  const takePhoto = async () => {
    setLoading(true);
    
    try {
      const options = {
        mediaType: 'photo' as const,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      launchCamera(options, async (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          setLoading(false);
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          
          try {
            const position = await getCurrentPosition();
            setCurrentPhoto({
              uri: asset.uri,
              latitude: position.latitude,
              longitude: position.longitude,
            });
            setShowLocationModal(true);
          } catch (error) {
            Alert.alert(
              'Localisation non disponible',
              'Impossible d\'obtenir votre position. La photo sera sauvegardée sans localisation.',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Continuer', 
                  onPress: () => {
                    setCurrentPhoto({
                      uri: asset.uri,
                      latitude: 0,
                      longitude: 0,
                    });
                    setShowLocationModal(true);
                  }
                }
              ]
            );
          }
        }
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo');
    }
  };

  const selectFromGallery = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        try {
          const position = await getCurrentPosition();
          setCurrentPhoto({
            uri: asset.uri,
            latitude: position.latitude,
            longitude: position.longitude,
          });
          setShowLocationModal(true);
        } catch (error) {
          Alert.alert(
            'Localisation non disponible',
            'Impossible d\'obtenir votre position. La photo sera sauvegardée sans localisation.',
            [
              { text: 'Annuler', style: 'cancel' },
              { 
                text: 'Continuer', 
                onPress: () => {
                  setCurrentPhoto({
                    uri: asset.uri,
                    latitude: 0,
                    longitude: 0,
                  });
                  setShowLocationModal(true);
                }
              }
            ]
          );
        }
      }
    });
  };

  const savePhoto = async () => {
    if (!currentPhoto) return;

    try {
      const photoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const photo: Photo = {
        id: photoId,
        uri: currentPhoto.uri,
        latitude: currentPhoto.latitude,
        longitude: currentPhoto.longitude,
        timestamp: new Date(),
        locationName: locationName.trim() || undefined,
      };

      await StorageService.savePhoto(photo);

      // Si un nom de lieu est fourni, créer ou mettre à jour le lieu
      if (locationName.trim() && currentPhoto.latitude !== 0 && currentPhoto.longitude !== 0) {
        const locations = await StorageService.getLocations();
        let location = locations.find(loc => 
          loc.name.toLowerCase() === locationName.toLowerCase().trim()
        );

        if (location) {
          // Mettre à jour le lieu existant
          await StorageService.updateLocationVisit(location.id, photo);
        } else {
          // Créer un nouveau lieu
          const newLocation: Location = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: locationName.trim(),
            latitude: currentPhoto.latitude,
            longitude: currentPhoto.longitude,
            visitGoal: parseInt(visitGoal) || 5,
            currentVisits: 1,
            weekStartDate: getWeekStart(new Date()),
            photos: [photo],
          };
          
          await StorageService.saveLocation(newLocation);
        }
      }

      setShowLocationModal(false);
      setCurrentPhoto(null);
      setLocationName('');
      setVisitGoal('5');
      
      Alert.alert('Succès', 'Photo sauvegardée avec succès !');
      loadRecentPhotos();
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
    }
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📷 Caméra</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.cameraButton, loading && styles.disabledButton]}
          onPress={takePhoto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📸</Text>
              <Text style={styles.buttonText}>Prendre une photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={selectFromGallery}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Choisir depuis la galerie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentPhotosContainer}>
        <Text style={styles.sectionTitle}>Photos récentes</Text>
        <View style={styles.photosGrid}>
          {recentPhotos.map((photo) => (
            <View key={photo.id} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
              {photo.locationName && (
                <Text style={styles.photoLocation} numberOfLines={1}>
                  📍 {photo.locationName}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Détails de la photo</Text>
            
            {currentPhoto && (
              <Image source={{ uri: currentPhoto.uri }} style={styles.previewImage} />
            )}

            <TextInput
              style={styles.input}
              placeholder="Nom du lieu (optionnel)"
              value={locationName}
              onChangeText={setLocationName}
            />

            {locationName.trim() && (
              <TextInput
                style={styles.input}
                placeholder="Objectif de visites par semaine"
                value={visitGoal}
                onChangeText={setVisitGoal}
                keyboardType="numeric"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={savePhoto}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  cameraButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  galleryButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
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
  recentPhotosContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  photoLocation: {
    padding: 8,
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
    maxHeight: '80%',
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
    marginBottom: 15,
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
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CameraScreen;
