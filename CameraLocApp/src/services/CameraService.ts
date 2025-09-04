import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';

export interface CameraResult {
  uri: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

export class CameraService {
  static async takePhoto(): Promise<CameraResult | null> {
    return new Promise((resolve) => {
      console.log('📸 Ouverture de la caméra...');

      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        saveToPhotos: true, // Sauvegarde automatique dans la galerie
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        this.handleImagePickerResponse(response, resolve, 'caméra');
      });
    });
  }

  static async selectFromGallery(): Promise<CameraResult | null> {
    return new Promise((resolve) => {
      console.log('🖼️ Ouverture de la galerie...');

      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        selectionLimit: 1,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        this.handleImagePickerResponse(response, resolve, 'galerie');
      });
    });
  }

  static async showImageSourceDialog(): Promise<CameraResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Sélectionner une image',
        'Choisissez la source de votre image',
        [
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: '📷 Caméra',
            onPress: async () => {
              const result = await this.takePhoto();
              resolve(result);
            },
          },
          {
            text: '🖼️ Galerie',
            onPress: async () => {
              const result = await this.selectFromGallery();
              resolve(result);
            },
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  }

  private static handleImagePickerResponse(
    response: ImagePickerResponse,
    resolve: (value: CameraResult | null) => void,
    source: string
  ): void {
    if (response.didCancel) {
      console.log('👤 Utilisateur a annulé la sélection depuis', source);
      resolve(null);
      return;
    }

    if (response.errorMessage) {
      console.error('❌ Erreur lors de la sélection depuis', source, ':', response.errorMessage);
      Alert.alert(
        'Erreur',
        `Une erreur est survenue lors de l'accès à ${source}: ${response.errorMessage}`
      );
      resolve(null);
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      
      if (!asset.uri) {
        console.error('❌ Aucune URI dans la réponse de', source);
        Alert.alert('Erreur', 'Impossible de récupérer l\'image');
        resolve(null);
        return;
      }

      const result: CameraResult = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type,
        fileName: asset.fileName,
      };

      console.log('✅ Image sélectionnée depuis', source, ':', {
        uri: result.uri,
        dimensions: `${result.width}x${result.height}`,
        size: result.fileSize ? `${Math.round(result.fileSize / 1024)}KB` : 'Inconnue'
      });

      resolve(result);
    } else {
      console.error('❌ Aucune image dans la réponse de', source);
      resolve(null);
    }
  }

  static async requestCameraPermission(): Promise<boolean> {
    // Les permissions sont gérées par PermissionService
    // Cette méthode est gardée pour compatibilité
    return true;
  }

  static getImageInfo(result: CameraResult): string {
    const parts: string[] = [];
    
    if (result.width && result.height) {
      parts.push(`${result.width}x${result.height}`);
    }
    
    if (result.fileSize) {
      const sizeKB = Math.round(result.fileSize / 1024);
      if (sizeKB < 1024) {
        parts.push(`${sizeKB}KB`);
      } else {
        parts.push(`${(sizeKB / 1024).toFixed(1)}MB`);
      }
    }
    
    if (result.type) {
      parts.push(result.type.split('/')[1]?.toUpperCase() || 'IMG');
    }

    return parts.join(' • ');
  }

  static isValidImageUri(uri: string): boolean {
    if (!uri) return false;
    
    // Vérifier que l'URI est valide
    const validSchemes = ['file://', 'content://', 'ph://', 'assets-library://'];
    return validSchemes.some(scheme => uri.startsWith(scheme));
  }

  static getImageMimeType(fileName?: string): string {
    if (!fileName) return 'image/jpeg';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'heic':
      case 'heif':
        return 'image/heic';
      default:
        return 'image/jpeg';
    }
  }
}
