import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PermissionService } from '../services/PermissionService';

interface PermissionScreenProps {
  onPermissionsGranted: (permissions: { camera: boolean; location: boolean }) => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({ onPermissionsGranted }) => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    setLoading(true);
    
    try {
      const permissions = await PermissionService.requestAllPermissions();
      
      if (permissions.camera && permissions.location) {
        onPermissionsGranted(permissions);
      } else {
        const missingPermissions = [];
        if (!permissions.camera) missingPermissions.push('caméra');
        if (!permissions.location) missingPermissions.push('localisation');
        
        Alert.alert(
          'Permissions requises',
          `L'application nécessite l'accès à ${missingPermissions.join(' et ')} pour fonctionner correctement. Vous pouvez continuer mais certaines fonctionnalités seront limitées.`,
          [
            { 
              text: 'Continuer quand même', 
              onPress: () => onPermissionsGranted(permissions) 
            },
            { 
              text: 'Réessayer', 
              onPress: requestPermissions 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la demande de permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>🔐 Permissions requises</Text>
        
        <View style={styles.permissionContainer}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>📷</Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Accès à la caméra</Text>
              <Text style={styles.permissionDescription}>
                Nécessaire pour prendre des photos et créer votre journal de voyage
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>📍</Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Accès à la localisation</Text>
              <Text style={styles.permissionDescription}>
                Permet d'associer vos photos à des lieux précis sur la carte
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={requestPermissions}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Autoriser les permissions</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          Ces permissions sont essentielles pour le bon fonctionnement de l'application. 
          Vous pourrez les modifier à tout moment dans les paramètres de votre appareil.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  permissionContainer: {
    marginBottom: 30,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PermissionScreen;
