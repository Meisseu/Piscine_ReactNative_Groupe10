/**
 * Service API pour communiquer avec le backend
 * Gère l'upload de vraies photos et la communication avec la base de données
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface Photo {
  id: string;
  filename: string;
  url: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  timestamp: string;
  user_id: string;
}

interface Location {
  id: string;
  name: string;
  visit_goal: number;
  current_visits: number;
  week_start: string;
  user_id: string;
}

export class ApiService {
  // Remplacez par votre adresse IP locale (pas localhost)
  private static BASE_URL = 'http://192.168.1.100:3000/api';
  
  /**
   * Configuration de l'URL de base
   * Appelez cette méthode avec votre IP locale
   */
  static setBaseUrl(url: string) {
    this.BASE_URL = url;
  }

  // =================== AUTHENTIFICATION ===================

  static async register(email: string, password: string, name: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.user };
      } else {
        return { success: false, error: data.error || 'Erreur d\'inscription' };
      }
    } catch (error) {
      console.error('❌ Erreur inscription API:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  }

  static async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.user };
      } else {
        return { success: false, error: data.error || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('❌ Erreur connexion API:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  }

  // =================== PHOTOS ===================

  static async uploadPhoto(
    photoUri: string,
    latitude: number,
    longitude: number,
    userId: string,
    locationName?: string
  ): Promise<ApiResponse<Photo>> {
    try {
      const formData = new FormData();
      
      // Ajouter la photo
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      } as any);

      // Ajouter les métadonnées
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('userId', userId);
      formData.append('timestamp', new Date().toISOString());
      
      if (locationName) {
        formData.append('locationName', locationName);
      }

      const response = await fetch(`${this.BASE_URL}/photos`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.photo };
      } else {
        return { success: false, error: data.error || 'Erreur d\'upload' };
      }
    } catch (error) {
      console.error('❌ Erreur upload photo:', error);
      return { success: false, error: 'Erreur lors de l\'upload de la photo' };
    }
  }

  static async getUserPhotos(userId: string): Promise<ApiResponse<Photo[]>> {
    try {
      const response = await fetch(`${this.BASE_URL}/photos/${userId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.photos };
      } else {
        return { success: false, error: data.error || 'Erreur de récupération' };
      }
    } catch (error) {
      console.error('❌ Erreur récupération photos:', error);
      return { success: false, error: 'Erreur de récupération des photos' };
    }
  }

  static async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.BASE_URL}/photos/${photoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Erreur de suppression' };
      }
    } catch (error) {
      console.error('❌ Erreur suppression photo:', error);
      return { success: false, error: 'Erreur lors de la suppression' };
    }
  }

  // =================== LIEUX ===================

  static async createLocation(
    name: string,
    userId: string,
    visitGoal: number = 0
  ): Promise<ApiResponse<Location>> {
    try {
      const response = await fetch(`${this.BASE_URL}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, userId, visitGoal }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.location };
      } else {
        return { success: false, error: data.error || 'Erreur de création' };
      }
    } catch (error) {
      console.error('❌ Erreur création lieu:', error);
      return { success: false, error: 'Erreur lors de la création du lieu' };
    }
  }

  static async getUserLocations(userId: string): Promise<ApiResponse<Location[]>> {
    try {
      const response = await fetch(`${this.BASE_URL}/locations/${userId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.locations };
      } else {
        return { success: false, error: data.error || 'Erreur de récupération' };
      }
    } catch (error) {
      console.error('❌ Erreur récupération lieux:', error);
      return { success: false, error: 'Erreur de récupération des lieux' };
    }
  }

  // =================== UTILITAIRES ===================

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Serveur non disponible:', error);
      return false;
    }
  }

  /**
   * Obtenir l'adresse IP locale pour configurer l'API
   * À appeler depuis l'app pour configurer automatiquement l'URL
   */
  static getLocalIpInstructions(): string {
    return `
Pour configurer l'API, trouvez votre adresse IP locale :

Windows:
1. Ouvrez cmd
2. Tapez: ipconfig
3. Cherchez "IPv4 Address" dans votre connexion WiFi/Ethernet

Mac/Linux:
1. Ouvrez Terminal
2. Tapez: ifconfig | grep inet
3. Cherchez l'adresse 192.168.x.x ou 10.x.x.x

Puis dans votre app, appelez :
ApiService.setBaseUrl('http://VOTRE_IP:3000/api');
    `;
  }
}

export default ApiService;
