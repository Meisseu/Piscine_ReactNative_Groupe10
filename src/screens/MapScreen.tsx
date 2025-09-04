import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Photo, Location, WeeklyProgress } from '../types';
import { StorageService } from '../services/StorageService';

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [photosData, locationsData, progressData] = await Promise.all([
        StorageService.getPhotos(),
        StorageService.getLocations(),
        StorageService.getWeeklyProgress(),
      ]);

      setPhotos(photosData);
      setLocations(locationsData);
      setWeeklyProgress(progressData);

      // Centrer la carte sur la première photo ou location
      if (photosData.length > 0) {
        const firstPhoto = photosData[0];
        setRegion({
          latitude: firstPhoto.latitude,
          longitude: firstPhoto.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else if (locationsData.length > 0) {
        const firstLocation = locationsData[0];
        setRegion({
          latitude: firstLocation.latitude,
          longitude: firstLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la carte');
    }
  };

  const onPhotoMarkerPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const onLocationMarkerPress = (location: Location) => {
    setSelectedLocation(location);
    setShowLocationModal(true);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#27ae60';
    if (percentage >= 75) return '#f39c12';
    if (percentage >= 50) return '#e67e22';
    return '#e74c3c';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Carte</Text>
      
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Marqueurs pour les photos individuelles */}
        {photos
          .filter(photo => photo.latitude !== 0 && photo.longitude !== 0)
          .map((photo) => (
            <Marker
              key={photo.id}
              coordinate={{
                latitude: photo.latitude,
                longitude: photo.longitude,
              }}
              onPress={() => onPhotoMarkerPress(photo)}
            >
              <View style={styles.photoMarker}>
                <Text style={styles.markerText}>📷</Text>
              </View>
            </Marker>
          ))}

        {/* Marqueurs pour les lieux avec progression */}
        {locations
          .filter(location => location.latitude !== 0 && location.longitude !== 0)
          .map((location) => {
            const progress = weeklyProgress.find(p => p.locationId === location.id);
            const progressPercentage = progress?.completionPercentage || 0;
            
            return (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                onPress={() => onLocationMarkerPress(location)}
              >
                <View style={[
                  styles.locationMarker,
                  { backgroundColor: getProgressColor(progressPercentage) }
                ]}>
                  <Text style={styles.markerText}>📍</Text>
                  <Text style={styles.progressText}>
                    {Math.round(progressPercentage)}%
                  </Text>
                </View>
              </Marker>
            );
          })}
      </MapView>

      {/* Modal pour les détails de photo */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Text style={styles.modalTitle}>📷 Détails de la photo</Text>
                <Image 
                  source={{ uri: selectedPhoto.uri }} 
                  style={styles.modalImage} 
                />
                <View style={styles.photoDetails}>
                  <Text style={styles.detailText}>
                    📅 {formatDate(selectedPhoto.timestamp)}
                  </Text>
                  {selectedPhoto.locationName && (
                    <Text style={styles.detailText}>
                      📍 {selectedPhoto.locationName}
                    </Text>
                  )}
                  <Text style={styles.detailText}>
                    🌍 {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPhotoModal(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour les détails de lieu */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLocation && (
              <>
                <Text style={styles.modalTitle}>📍 {selectedLocation.name}</Text>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressTitle}>Progression hebdomadaire</Text>
                  {(() => {
                    const progress = weeklyProgress.find(p => p.locationId === selectedLocation.id);
                    const percentage = progress?.completionPercentage || 0;
                    return (
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: getProgressColor(percentage)
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressPercentage}>
                          {Math.round(percentage)}%
                        </Text>
                      </View>
                    );
                  })()}
                  
                  <Text style={styles.progressDetails}>
                    {selectedLocation.currentVisits} / {selectedLocation.visitGoal} visites cette semaine
                  </Text>
                </View>

                <View style={styles.photosContainer}>
                  <Text style={styles.photosTitle}>Photos ({selectedLocation.photos.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedLocation.photos.map((photo) => (
                      <TouchableOpacity
                        key={photo.id}
                        onPress={() => {
                          setSelectedPhoto(photo);
                          setShowLocationModal(false);
                          setShowPhotoModal(true);
                        }}
                      >
                        <Image 
                          source={{ uri: photo.uri }} 
                          style={styles.thumbnailImage} 
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={styles.closeButtonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  map: {
    flex: 1,
    margin: 10,
    borderRadius: 15,
  },
  photoMarker: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  locationMarker: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    fontSize: 16,
  },
  progressText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: -2,
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
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  photoDetails: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    minWidth: 40,
  },
  progressDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  photosContainer: {
    marginBottom: 20,
  },
  photosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  closeButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapScreen;
