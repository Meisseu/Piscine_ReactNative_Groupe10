import { Photo, Location, WeeklyProgress } from '../types';
import { DatabaseService } from './DatabaseService';
import { AuthService } from './AuthService';

export class StorageService {
  // Photos
  static async savePhoto(photo: Photo): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await DatabaseService.savePhoto(photo, currentUser.id);
      console.log('✅ Photo sauvegardée:', photo.id);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la photo:', error);
      throw error;
    }
  }

  static async getPhotos(): Promise<Photo[]> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ Aucun utilisateur connecté, retour d\'un tableau vide');
        return [];
      }

      const photos = await DatabaseService.getPhotos(currentUser.id);
      console.log('📸 Photos récupérées:', photos.length);
      return photos;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des photos:', error);
      return [];
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await DatabaseService.deletePhoto(photoId, currentUser.id);
      console.log('🗑️ Photo supprimée:', photoId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la photo:', error);
      throw error;
    }
  }

  static async getPhotosByDate(date: Date): Promise<Photo[]> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const photos = await DatabaseService.getPhotosByDate(date, currentUser.id);
      console.log('📅 Photos pour la date', date.toDateString(), ':', photos.length);
      return photos;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des photos par date:', error);
      return [];
    }
  }

  // Locations
  static async saveLocation(location: Location): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await DatabaseService.saveLocation(location, currentUser.id);
      console.log('✅ Lieu sauvegardé:', location.name);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du lieu:', error);
      throw error;
    }
  }

  static async getLocations(): Promise<Location[]> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ Aucun utilisateur connecté, retour d\'un tableau vide');
        return [];
      }

      const locations = await DatabaseService.getLocations(currentUser.id);
      console.log('📍 Lieux récupérés:', locations.length);
      return locations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des lieux:', error);
      return [];
    }
  }

  static async updateLocationVisit(locationId: string, photo: Photo): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await DatabaseService.updateLocationVisit(locationId, photo, currentUser.id);
      console.log('✅ Visite du lieu mise à jour:', locationId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la visite:', error);
      throw error;
    }
  }

  static async getWeeklyProgress(): Promise<WeeklyProgress[]> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      const progress = await DatabaseService.getWeeklyProgress(currentUser.id);
      console.log('📊 Progression hebdomadaire récupérée:', progress.length, 'lieux');
      return progress;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la progression:', error);
      return [];
    }
  }

  // Méthodes utilitaires
  static async clearAllData(): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      await DatabaseService.clearAllUserData(currentUser.id);
      console.log('✅ Toutes les données utilisateur supprimées');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des données:', error);
      throw error;
    }
  }

  static async exportData(): Promise<{ photos: Photo[]; locations: Location[] }> {
    try {
      const [photos, locations] = await Promise.all([
        this.getPhotos(),
        this.getLocations()
      ]);

      console.log('📦 Données exportées:', { photosCount: photos.length, locationsCount: locations.length });
      return { photos, locations };
    } catch (error) {
      console.error('❌ Erreur lors de l\'export des données:', error);
      throw error;
    }
  }
}