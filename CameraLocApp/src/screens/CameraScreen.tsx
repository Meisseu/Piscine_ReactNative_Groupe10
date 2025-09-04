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
  ScrollView,
} from 'react-native';
import { Photo, Location } from '../types';
import { StorageService } from '../services/StorageService';
import { CameraService } from '../services/CameraService';
import { LocationService } from '../services/LocationService';
import { generateSimpleId } from '../utils/uuid';

const CameraScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<any>(null);
  const [locationName, setLocationName] = useState('');
  const [visitGoal, setVisitGoal] = useState('');
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [selectedExistingLocation, setSelectedExistingLocation] = useState<Location | null>(null);
  const [isCreatingNewLocation, setIsCreatingNewLocation] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    loadRecentPhotos();
    loadLocations();
  }, []);

  const loadRecentPhotos = async () => {
    try {
      const photos = await StorageService.getPhotos();
      // Afficher les 6 dernières photos
      setRecentPhotos(photos.slice(0, 6));
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const locationsData = await StorageService.getLocations();
      setLocations(locationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
    }
  };

  const getCurrentPosition = async () => {
    try {
      console.log('📍 Récupération de la position...');
      const position = await LocationService.getCurrentPosition();
      console.log('✅ Position obtenue:', position);
      return position;
    } catch (error: any) {
      console.error('❌ Erreur de géolocalisation:', error);
      throw error;
    }
  };

  const takePhoto = async () => {
    setLoading(true);
    
    try {
      console.log('📸 Lancement de la caméra...');
      const imageResult = await CameraService.takePhoto();
      
      if (!imageResult) {
        console.log('👤 Utilisateur a annulé la prise de photo');
        setLoading(false);
        return;
      }

      console.log('✅ Photo prise:', imageResult.uri);

      // Obtenir la position
      try {
        const position = await getCurrentPosition();
        setCurrentPhoto({
          ...imageResult,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
        });
      } catch (locationError: any) {
        console.warn('⚠️ Impossible d\'obtenir la position:', locationError.message);
        Alert.alert(
          'Localisation non disponible',
          'Impossible d\'obtenir votre position. La photo sera sauvegardée sans géolocalisation.',
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Continuer', 
              onPress: () => {
                setCurrentPhoto({
                  ...imageResult,
                  latitude: 0,
                  longitude: 0,
                });
              }
            }
          ]
        );
      }

      setShowLocationModal(true);
    } catch (error: any) {
      console.error('❌ Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo');
    } finally {
      setLoading(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      console.log('🖼️ Ouverture de la galerie...');
      const imageResult = await CameraService.selectFromGallery();
      
      if (!imageResult) {
        console.log('👤 Utilisateur a annulé la sélection');
        return;
      }

      console.log('✅ Image sélectionnée:', imageResult.uri);

      // Pour les images de galerie, on demande quand même la position actuelle
      try {
        const position = await getCurrentPosition();
        setCurrentPhoto({
          ...imageResult,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
        });
      } catch (locationError: any) {
        console.warn('⚠️ Position non disponible pour l\'image de galerie');
        setCurrentPhoto({
          ...imageResult,
          latitude: 0,
          longitude: 0,
        });
      }

      setShowLocationModal(true);
    } catch (error: any) {
      console.error('❌ Erreur lors de la sélection:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection de l\'image');
    }
  };

  const savePhoto = async () => {
    if (!currentPhoto) return;

    try {
      const photoId = generateSimpleId();
      
      let finalLocationName = '';
      
      if (isCreatingNewLocation) {
        finalLocationName = locationName.trim() || 'Photo sans nom';
      } else {
        finalLocationName = selectedExistingLocation?.name || 'Photo sans nom';
      }

      const photo: Photo = {
        id: photoId,
        uri: currentPhoto.uri,
        latitude: currentPhoto.latitude || 0,
        longitude: currentPhoto.longitude || 0,
        timestamp: new Date(),
        locationName: finalLocationName,
      };

      await StorageService.savePhoto(photo);

      if (isCreatingNewLocation && locationName.trim() && currentPhoto.latitude !== 0) {
        // Créer un nouveau lieu
        const location: Location = {
          id: generateSimpleId(),
          name: locationName.trim(),
          latitude: currentPhoto.latitude,
          longitude: currentPhoto.longitude,
          visitGoal: parseInt(visitGoal) || 0,
          currentVisits: 1,
          weekStartDate: getWeekStart(new Date()),
          photos: [photo],
        };
        
        await StorageService.saveLocation(location);
        console.log('✅ Nouveau lieu créé:', location.name);
      } else if (!isCreatingNewLocation && selectedExistingLocation) {
        // Ajouter à un lieu existant
        await StorageService.updateLocationVisit(selectedExistingLocation.id, photo);
        console.log('✅ Visite ajoutée au lieu:', selectedExistingLocation.name);
      }

      // Nettoyer et recharger
      setShowLocationModal(false);
      setCurrentPhoto(null);
      setLocationName('');
      setVisitGoal('');
      setSelectedExistingLocation(null);
      setIsCreatingNewLocation(true);
      
      await Promise.all([loadRecentPhotos(), loadLocations()]);
      
      Alert.alert('🎉 Succès', 'Photo sauvegardée avec succès !');
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
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
      <Text style={styles.title}>📷 Studio Photo</Text>
      
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
              <Text style={styles.buttonText}>Prendre une Photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.galleryButton}
          onPress={selectFromGallery}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Choisir depuis la Galerie</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentPhotosContainer}>
        <Text style={styles.sectionTitle}>✨ Photos Récentes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photosGrid}>
            {recentPhotos.map((photo, index) => (
              <View key={photo.id} style={[styles.photoItem, { marginLeft: index === 0 ? 0 : 15 }]}>
                <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
                <View style={styles.photoOverlay}>
                  {photo.locationName && (
                    <Text style={styles.photoLocation} numberOfLines={1}>
                      📍 {photo.locationName}
                    </Text>
                  )}
                  <Text style={styles.photoDate}>
                    {photo.timestamp.toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Modal pour nommer la photo et gérer les lieux */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📸 Nice pic!</Text>
            
            {currentPhoto && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: currentPhoto.uri }} style={styles.previewImage} />
                <View style={styles.imageInfo}>
                  {currentPhoto.latitude !== 0 && currentPhoto.longitude !== 0 ? (
                    <Text style={styles.locationInfo}>
                      📍 {currentPhoto.latitude.toFixed(6)}, {currentPhoto.longitude.toFixed(6)}
                      {currentPhoto.accuracy && ` (±${Math.round(currentPhoto.accuracy)}m)`}
                    </Text>
                  ) : (
                    <Text style={styles.noLocationInfo}>
                      ⚠️ Aucune géolocalisation disponible
                    </Text>
                  )}
                </View>
              </View>
            )}

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
                  📍 Lieu existant
                </Text>
              </TouchableOpacity>
            </View>

            {isCreatingNewLocation ? (
              // Interface pour créer un nouveau lieu
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Café de Montmartre, Parc des Buttes..."
                  value={locationName}
                  onChangeText={setLocationName}
                />
                
                {locationName.trim() && (
                  <>
                    <Text style={styles.inputLabel}>🎯 Objectif de visites par semaine (optionnel)</Text>
                    <TextInput
                      style={[styles.input, { marginTop: 10 }]}
                      placeholder="Ex: 3 visites par semaine (laisser vide = pas d'objectif)"
                      value={visitGoal}
                      onChangeText={setVisitGoal}
                      keyboardType="numeric"
                    />
                  </>
                )}
              </View>
            ) : (
              // Interface pour sélectionner un lieu existant
              <View style={styles.existingLocationsContainer}>
                <Text style={styles.inputLabel}>📍 Choisissez un lieu existant</Text>
                {locations.length > 0 ? (
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
                            📍 {location.name}
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
                ) : (
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

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowLocationModal(false);
                  setCurrentPhoto(null);
                  setLocationName('');
                  setVisitGoal('');
                  setSelectedExistingLocation(null);
                  setIsCreatingNewLocation(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  ((isCreatingNewLocation && !locationName.trim()) || 
                   (!isCreatingNewLocation && !selectedExistingLocation)) && styles.disabledSaveButton
                ]}
                onPress={savePhoto}
                disabled={(isCreatingNewLocation && !locationName.trim()) || 
                         (!isCreatingNewLocation && !selectedExistingLocation)}
              >
                <Text style={styles.saveButtonText}>
                  {isCreatingNewLocation ? '✨ Créer & Sauvegarder' : '📍 Ajouter à ce lieu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
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
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  galleryButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  photosGrid: {
    flexDirection: 'row',
  },
  photoItem: {
    width: 120,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  photoOverlay: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  photoLocation: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: '600',
  },
  photoDate: {
    fontSize: 9,
    color: '#7f8c8d',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  imageInfo: {
    alignItems: 'center',
  },
  locationInfo: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
  },
  noLocationInfo: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: '600',
  },
  
  // Choix de lieu
  locationChoiceContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
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
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  choiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeChoiceButtonText: {
    color: '#fff',
  },
  
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    marginTop: 15,
    marginBottom: 8,
  },
  
  // Lieux existants
  existingLocationsContainer: {
    marginBottom: 20,
  },
  locationsList: {
    maxHeight: 200,
    marginTop: 10,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLocationOption: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db',
  },
  locationOptionContent: {
    flex: 1,
  },
  locationOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  selectedLocationOptionText: {
    color: '#3498db',
  },
  locationOptionStats: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  miniProgressBadge: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniProgressText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noLocationsMessage: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noLocationsText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 8,
  },
  noLocationsSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 12,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 15,
    flex: 0.45,
    alignItems: 'center',
  },
  disabledSaveButton: {
    backgroundColor: '#bdc3c7',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CameraScreen;