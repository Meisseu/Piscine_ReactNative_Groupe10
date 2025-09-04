import { Platform, Alert, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

export class PermissionService {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA 
        : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          console.log('✅ Permission caméra accordée');
          return true;
        case RESULTS.DENIED:
          Alert.alert(
            'Permission requise',
            'L\'accès à la caméra est nécessaire pour prendre des photos.',
            [{ text: 'OK' }]
          );
          return false;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission bloquée',
            'L\'accès à la caméra a été bloqué. Veuillez l\'activer dans les paramètres.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Paramètres', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission caméra:', error);
      return false;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    try {
      const permission: Permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          console.log('✅ Permission localisation accordée');
          return true;
        case RESULTS.DENIED:
          Alert.alert(
            'Permission requise',
            'L\'accès à la localisation est nécessaire pour enregistrer la position de vos photos.',
            [{ text: 'OK' }]
          );
          return false;
        case RESULTS.BLOCKED:
          Alert.alert(
            'Permission bloquée',
            'L\'accès à la localisation a été bloqué. Veuillez l\'activer dans les paramètres.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Paramètres', onPress: () => Linking.openSettings() }
            ]
          );
          return false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission localisation:', error);
      return false;
    }
  }

  static async requestAllPermissions(): Promise<{ camera: boolean; location: boolean }> {
    console.log('🔐 Demande de toutes les permissions...');
    
    const [cameraGranted, locationGranted] = await Promise.all([
      this.requestCameraPermission(),
      this.requestLocationPermission()
    ]);

    const result = {
      camera: cameraGranted,
      location: locationGranted
    };

    console.log('📋 Résultat des permissions:', result);
    return result;
  }
}