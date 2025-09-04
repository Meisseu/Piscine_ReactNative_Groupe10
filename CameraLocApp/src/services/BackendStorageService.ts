/**
 * Service de stockage qui utilise le backend API
 * Remplace StorageService pour utiliser de vraies photos
 */

import ApiService from './ApiService';
import { Photo, Location, User } from '../types';

export class BackendStorageService {
  
  // =================== PHOTOS ===================
  
  static async savePhoto(photo: Omit<Photo, 'id'>): Promise<string> {
    try {
      // Utiliser l'API pour uploader la vraie photo
      const result = await ApiService.uploadPhoto(
        photo.uri,
        photo.latitude,
        photo.longitude,
        photo.userId || '',
        photo.locationName
      );

      if (result.success && result.data) {
        console.log('✅ Photo sauvegardée sur le backend:', result.data.id);
        return result.data.id;
      } else {
        throw new Error(result.error || 'Erreur sauvegarde photo');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde photo backend:', error);
      throw error;
    }
  }

  static async getPhotos(userId: string): Promise<Photo[]> {
    try {
      const result = await ApiService.getUserPhotos(userId);
      
      if (result.success && result.data) {
        // Convertir le format backend vers le format app
        return result.data.map(photo => ({
          id: photo.id,
          uri: photo.url, // URL complète de l'image
          latitude: photo.latitude,
          longitude: photo.longitude,
          locationName: photo.location_name || undefined,
          timestamp: photo.timestamp,
          userId: photo.user_id
        }));
      } else {
        console.error('❌ Erreur récupération photos:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur récupération photos backend:', error);
      return [];
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const result = await ApiService.deletePhoto(photoId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur suppression photo');
      }
      
      console.log('✅ Photo supprimée du backend');
    } catch (error) {
      console.error('❌ Erreur suppression photo backend:', error);
      throw error;
    }
  }

  // =================== LIEUX ===================

  static async saveLocation(location: Omit<Location, 'id'>): Promise<string> {
    try {
      const result = await ApiService.createLocation(
        location.name,
        location.userId || '',
        location.visitGoal
      );

      if (result.success && result.data) {
        console.log('✅ Lieu sauvegardé sur le backend:', result.data.id);
        return result.data.id;
      } else {
        throw new Error(result.error || 'Erreur sauvegarde lieu');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde lieu backend:', error);
      throw error;
    }
  }

  static async getLocations(userId: string): Promise<Location[]> {
    try {
      const result = await ApiService.getUserLocations(userId);
      
      if (result.success && result.data) {
        // Convertir le format backend vers le format app
        return result.data.map(location => ({
          id: location.id,
          name: location.name,
          visitGoal: location.visit_goal,
          currentVisits: location.current_visits,
          userId: location.user_id,
          weekStart: location.week_start
        }));
      } else {
        console.error('❌ Erreur récupération lieux:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur récupération lieux backend:', error);
      return [];
    }
  }

  static async updateLocation(locationId: string, updates: Partial<Location>): Promise<void> {
    // TODO: Implémenter la mise à jour côté backend
    console.log('⚠️ Mise à jour lieu non implémentée côté backend');
  }

  // =================== UTILISATEURS ===================

  static async registerUser(email: string, password: string, name: string): Promise<User> {
    try {
      const result = await ApiService.register(email, password, name);
      
      if (result.success && result.data) {
        const user: User = {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          password: '', // Ne pas stocker le mot de passe côté client
          createdAt: result.data.created_at
        };
        
        console.log('✅ Utilisateur créé sur le backend:', user.id);
        return user;
      } else {
        throw new Error(result.error || 'Erreur création utilisateur');
      }
    } catch (error) {
      console.error('❌ Erreur création utilisateur backend:', error);
      throw error;
    }
  }

  static async loginUser(email: string, password: string): Promise<User> {
    try {
      const result = await ApiService.login(email, password);
      
      if (result.success && result.data) {
        const user: User = {
          id: result.data.id,
          email: result.data.email,
          name: result.data.name,
          password: '', // Ne pas stocker le mot de passe côté client
          createdAt: result.data.created_at
        };
        
        console.log('✅ Utilisateur connecté via backend:', user.id);
        return user;
      } else {
        throw new Error(result.error || 'Erreur connexion utilisateur');
      }
    } catch (error) {
      console.error('❌ Erreur connexion utilisateur backend:', error);
      throw error;
    }
  }

  // Garder la gestion locale de la session utilisateur
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Pour l'instant, on utilise AsyncStorage pour la session
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const data = await AsyncStorage.getItem('@currentUser');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur courant:', error);
      return null;
    }
  }

  static async saveCurrentUser(user: User): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('@currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('❌ Erreur sauvegarde utilisateur courant:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('@currentUser');
      console.log('✅ Utilisateur déconnecté');
    } catch (error) {
      console.error('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  // =================== CONFIGURATION ===================

  static async checkBackendConnection(): Promise<boolean> {
    const isHealthy = await ApiService.checkHealth();
    if (!isHealthy) {
      console.warn('⚠️ Backend non disponible. Vérifiez que le serveur est démarré.');
    }
    return isHealthy;
  }

  static configureBackendUrl(ipAddress: string): void {
    const url = `http://${ipAddress}:3000/api`;
    ApiService.setBaseUrl(url);
    console.log(`🔧 Backend configuré sur: ${url}`);
  }
}

export default BackendStorageService;
