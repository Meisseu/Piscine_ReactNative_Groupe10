import AsyncStorage from '@react-native-async-storage/async-storage';
import { Photo, Location, WeeklyProgress } from '../types';

const PHOTOS_KEY = '@photos';
const LOCATIONS_KEY = '@locations';

export class StorageService {
  // Photos
  static async savePhoto(photo: Photo): Promise<void> {
    try {
      const existingPhotos = await this.getPhotos();
      const updatedPhotos = [...existingPhotos, photo];
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la photo:', error);
      throw error;
    }
  }

  static async getPhotos(): Promise<Photo[]> {
    try {
      const photosData = await AsyncStorage.getItem(PHOTOS_KEY);
      if (photosData) {
        const photos = JSON.parse(photosData);
        // Convertir les dates string en objets Date
        return photos.map((photo: any) => ({
          ...photo,
          timestamp: new Date(photo.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      return [];
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const photos = await this.getPhotos();
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(updatedPhotos));
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw error;
    }
  }

  static async getPhotosByDate(date: Date): Promise<Photo[]> {
    const photos = await this.getPhotos();
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return photos.filter(photo => {
      const photoDate = new Date(photo.timestamp.getFullYear(), 
                                photo.timestamp.getMonth(), 
                                photo.timestamp.getDate());
      return photoDate.getTime() === targetDate.getTime();
    });
  }

  // Locations
  static async saveLocation(location: Location): Promise<void> {
    try {
      const existingLocations = await this.getLocations();
      const existingIndex = existingLocations.findIndex(loc => loc.id === location.id);
      
      let updatedLocations;
      if (existingIndex >= 0) {
        updatedLocations = [...existingLocations];
        updatedLocations[existingIndex] = location;
      } else {
        updatedLocations = [...existingLocations, location];
      }
      
      await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du lieu:', error);
      throw error;
    }
  }

  static async getLocations(): Promise<Location[]> {
    try {
      const locationsData = await AsyncStorage.getItem(LOCATIONS_KEY);
      if (locationsData) {
        const locations = JSON.parse(locationsData);
        // Convertir les dates string en objets Date
        return locations.map((location: any) => ({
          ...location,
          weekStartDate: new Date(location.weekStartDate),
          photos: location.photos.map((photo: any) => ({
            ...photo,
            timestamp: new Date(photo.timestamp)
          }))
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      return [];
    }
  }

  static async updateLocationVisit(locationId: string, photo: Photo): Promise<void> {
    try {
      const locations = await this.getLocations();
      const locationIndex = locations.findIndex(loc => loc.id === locationId);
      
      if (locationIndex >= 0) {
        const location = locations[locationIndex];
        const now = new Date();
        const weekStart = this.getWeekStart(now);
        
        // Vérifier si on est dans une nouvelle semaine
        if (location.weekStartDate.getTime() !== weekStart.getTime()) {
          location.weekStartDate = weekStart;
          location.currentVisits = 0;
        }
        
        // Ajouter la visite
        location.currentVisits += 1;
        location.photos.push(photo);
        
        await this.saveLocation(location);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la visite:', error);
      throw error;
    }
  }

  static async getWeeklyProgress(): Promise<WeeklyProgress[]> {
    const locations = await this.getLocations();
    
    return locations.map(location => ({
      locationId: location.id,
      weekStartDate: location.weekStartDate,
      targetVisits: location.visitGoal,
      actualVisits: location.currentVisits,
      completionPercentage: (location.currentVisits / location.visitGoal) * 100
    }));
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    return new Date(d.setDate(diff));
  }

  // Méthodes utilitaires
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([PHOTOS_KEY, LOCATIONS_KEY]);
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
      throw error;
    }
  }
}
