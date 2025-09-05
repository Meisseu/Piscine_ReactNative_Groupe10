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
  FlatList,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Photo, Location, WeeklyProgress } from '../types';
import { StorageService } from '../services/StorageService';

const MapScreen: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données de la carte');
    }
  };

  const getMapRegion = () => {
    if (photos.length === 0) {
      return {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const validPhotos = photos.filter(p => p.latitude !== 0 && p.longitude !== 0);
    if (validPhotos.length === 0) {
      return {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = validPhotos.map(p => p.latitude);
    const longitudes = validPhotos.map(p => p.longitude);
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

  const onPhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const onLocationPress = (location: Location) => {
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

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity 
      style={styles.photoCard}
      onPress={() => onPhotoPress(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          📷 Photo
        </Text>
        {item.locationName && (
          <Text style={styles.cardLocation}>
            📍 {item.locationName}
          </Text>
        )}
        <Text style={styles.cardDate}>
          {formatDate(item.timestamp)}
        </Text>
        <Text style={styles.cardCoords}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLocationItem = ({ item }: { item: Location }) => {
    const progress = weeklyProgress.find(p => p.locationId === item.id);
    const progressPercentage = progress?.completionPercentage || 0;
    
    return (
      <TouchableOpacity 
        style={styles.locationCard}
        onPress={() => onLocationPress(item)}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
            📍 {item.name}
          </Text>
          <Text style={styles.cardCoords}>
            {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
          </Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Progression: {Math.round(progressPercentage)}%
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(progressPercentage, 100)}%`,
                    backgroundColor: getProgressColor(progressPercentage)
                  }
                ]} 
              />
            </View>
            <Text style={styles.visitText}>
              {item.currentVisits} / {item.visitGoal} visites cette semaine
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Carte</Text>
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={getMapRegion()}
          showsUserLocation={true}
          showsCompass={true}
          showsScale={true}
        >
          {photos.map((photo) => {
            if (photo.latitude === 0 || photo.longitude === 0) return null;
            return (
              <Marker
                key={photo.id}
                coordinate={{ latitude: photo.latitude, longitude: photo.longitude }}
                title={photo.locationName || 'Lieu inconnu'}
                description={formatDate(photo.timestamp)}
                onPress={() => onPhotoPress(photo)}
              >
                <View style={styles.customMarker}>
                  <Image source={{ uri: photo.uri }} style={styles.markerImage} />
                </View>
                <Callout>
                  <View style={styles.calloutContent}>
                    <Image source={{ uri: photo.uri }} style={styles.calloutImage} />
                    {photo.locationName ? (
                      <Text style={styles.cardLocation}>📍 {photo.locationName}</Text>
                    ) : null}
                    <Text style={styles.cardDate}>{formatDate(photo.timestamp)}</Text>
                    <Text style={styles.cardCoords}>
                      {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
        </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      <View style={styles.dataContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Photos géolocalisées ({photos.length})</Text>
          <FlatList
            data={photos.filter(photo => photo.latitude !== 0 && photo.longitude !== 0)}
            renderItem={renderPhotoItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Lieux avec objectifs ({locations.length})</Text>
          <FlatList
            data={locations}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      </View>

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
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  calloutContent: {
    width: 200,
  },
  calloutImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  dataContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  flatListContent: {
    paddingRight: 20,
  },
  photoCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationCard: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardLocation: {
    fontSize: 12,
    color: '#3498db',
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  cardCoords: {
    fontSize: 9,
    color: '#95a5a6',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  visitText: {
    fontSize: 10,
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
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
    minWidth: 40,
  },
  progressDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  photosContainer: {
    marginBottom: 20,
    marginTop: 15,
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
