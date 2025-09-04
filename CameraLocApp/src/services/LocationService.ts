import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
}

export class LocationService {
  static async getCurrentPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      console.log('📍 Demande de position actuelle...');

      Geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };

          console.log('✅ Position obtenue:', {
            lat: coordinates.latitude.toFixed(6),
            lng: coordinates.longitude.toFixed(6),
            accuracy: coordinates.accuracy?.toFixed(2) + 'm'
          });

          resolve(coordinates);
        },
        (error) => {
          console.error('❌ Erreur de géolocalisation:', error);
          
          let errorMessage = 'Impossible d\'obtenir votre position';
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = 'Permission de localisation refusée';
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = 'Position indisponible. Vérifiez votre GPS';
              break;
            case 3: // TIMEOUT
              errorMessage = 'Délai d\'attente dépassé pour la localisation';
              break;
            default:
              errorMessage = `Erreur de localisation: ${error.message}`;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          forceLocationManager: false,
          showLocationDialog: true,
        }
      );
    });
  }

  static async watchPosition(
    onSuccess: (position: LocationCoordinates) => void,
    onError: (error: Error) => void
  ): Promise<number> {
    console.log('👀 Démarrage du suivi de position...');

    return Geolocation.watchPosition(
      (position) => {
        const coordinates: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        };

        onSuccess(coordinates);
      },
      (error) => {
        console.error('❌ Erreur lors du suivi de position:', error);
        onError(new Error(`Erreur de suivi: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Minimum 10 mètres de déplacement
        interval: 5000, // Mise à jour toutes les 5 secondes
        fastestInterval: 2000,
        forceRequestLocation: true,
        forceLocationManager: false,
        showLocationDialog: true,
      }
    );
  }

  static stopWatchingPosition(watchId: number): void {
    console.log('🛑 Arrêt du suivi de position');
    Geolocation.stopObserving();
  }

  static async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS gère les permissions automatiquement avec react-native-permissions
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission de localisation',
          message: 'Cette application a besoin d\'accéder à votre localisation pour géolocaliser vos photos.',
          buttonNeutral: 'Demander plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  // Utilitaires de calcul de distance
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distance en mètres

    return Math.round(distance);
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static formatCoordinates(latitude: number, longitude: number): string {
    const latDirection = latitude >= 0 ? 'N' : 'S';
    const lonDirection = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude).toFixed(6)}°${latDirection}, ${Math.abs(longitude).toFixed(6)}°${lonDirection}`;
  }

  static isLocationValid(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180 &&
      !(latitude === 0 && longitude === 0)
    );
  }
}
