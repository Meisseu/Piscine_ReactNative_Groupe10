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
      console.log('🔐 Demande de permissions en cours...');
      const permissions = await PermissionService.requestAllPermissions();
      
      console.log('📋 Permissions obtenues:', permissions);
      
      if (permissions.camera && permissions.location) {
        Alert.alert(
          '✅ Permissions accordées',
          'Toutes les permissions ont été accordées. Vous pouvez maintenant utiliser toutes les fonctionnalités de l\'application !',
          [{ text: 'Continuer', onPress: () => onPermissionsGranted(permissions) }]
        );
      } else {
        const missingPermissions = [];
        if (!permissions.camera) missingPermissions.push('caméra');
        if (!permissions.location) missingPermissions.push('localisation');
        
        Alert.alert(
          '⚠️ Permissions partielles',
          `L'application nécessite l'accès à ${missingPermissions.join(' et ')} pour fonctionner correctement. Certaines fonctionnalités seront limitées.`,
          [
            { 
              text: 'Continuer quand même', 
              style: 'destructive',
              onPress: () => onPermissionsGranted(permissions) 
            },
            { 
              text: 'Réessayer', 
              onPress: () => setLoading(false)
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('❌ Erreur lors des permissions:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la demande de permissions. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => setLoading(false) }]
      );
    }
  };

  const skipPermissions = () => {
    Alert.alert(
      '⚠️ Passer les permissions',
      'En sautant les permissions, vous ne pourrez pas utiliser la caméra ni la géolocalisation. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer sans permissions', 
          style: 'destructive',
          onPress: () => onPermissionsGranted({ camera: false, location: false })
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>🔐 Permissions Requises</Text>
        <Text style={styles.subtitle}>
          Pour une expérience optimale, votre application a besoin de certaines permissions
        </Text>
        
        <View style={styles.permissionContainer}>
          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>📷</Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Accès à la Caméra</Text>
              <Text style={styles.permissionDescription}>
                Nécessaire pour prendre des photos et créer votre journal de voyage. 
                Sans cette permission, vous ne pourrez pas capturer de nouveaux souvenirs.
              </Text>
            </View>
          </View>

          <View style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>📍</Text>
            <View style={styles.permissionText}>
              <Text style={styles.permissionTitle}>Accès à la Localisation</Text>
              <Text style={styles.permissionDescription}>
                Permet d'associer automatiquement vos photos à des lieux précis sur la carte. 
                Indispensable pour le suivi de vos objectifs de visite.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Ces permissions sont essentielles pour le bon fonctionnement de l'application. 
            Vous pourrez les modifier à tout moment dans les paramètres de votre appareil.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={requestPermissions}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingButtonText}>Demande en cours...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.buttonIcon}>🚀</Text>
              <Text style={styles.buttonText}>Autoriser les Permissions</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={skipPermissions}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>
            Continuer sans permissions (fonctionnalités limitées)
          </Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          🔒 Vos données restent privées et sont stockées uniquement sur votre appareil. 
          Aucune information n'est envoyée vers des serveurs externes.
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
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionContainer: {
    marginBottom: 25,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  permissionIcon: {
    fontSize: 28,
    marginRight: 20,
    marginTop: 5,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  skipButtonText: {
    color: '#95a5a6',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default PermissionScreen;