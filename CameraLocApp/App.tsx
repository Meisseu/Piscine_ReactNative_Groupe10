import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  Alert,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthScreen from './src/screens/AuthScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import MainNavigator from './src/components/MainNavigator';
import { AuthService } from './src/services/AuthService';
import { User } from './src/types';

type AppState = 'loading' | 'auth' | 'permissions' | 'main';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<{
    camera: boolean;
    location: boolean;
  }>({ camera: false, location: false });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initialisation de l\'application...');
      
      // Initialiser la base de données et les services
      await AuthService.initialize();
      
      // Vérifier si l'utilisateur est déjà connecté
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        console.log('✅ Utilisateur déjà connecté:', currentUser.email);
        setUser(currentUser);
        setAppState('permissions');
      } else {
        console.log('👤 Aucun utilisateur connecté');
        setAppState('auth');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      Alert.alert(
        'Erreur d\'initialisation',
        'Une erreur est survenue lors du démarrage de l\'application. Veuillez redémarrer l\'app.',
        [{ text: 'OK', onPress: () => setAppState('auth') }]
      );
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAppState('permissions');
  };

  const handlePermissionsGranted = (grantedPermissions: {
    camera: boolean;
    location: boolean;
  }) => {
    setPermissions(grantedPermissions);
    setAppState('main');
    
    // Afficher un message si certaines permissions ne sont pas accordées
    const missingPermissions = [];
    if (!grantedPermissions.camera) missingPermissions.push('caméra');
    if (!grantedPermissions.location) missingPermissions.push('localisation');
    
    if (missingPermissions.length > 0) {
      Alert.alert(
        'Permissions limitées',
        `Certaines fonctionnalités peuvent être limitées car l'accès à ${missingPermissions.join(' et ')} n'est pas autorisé.`,
        [{ text: 'Compris' }]
      );
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setAppState('auth');
      setPermissions({ camera: false, location: false });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
  return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );

      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

      case 'permissions':
        return <PermissionScreen onPermissionsGranted={handlePermissionsGranted} />;

      case 'main':
        return (
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f7fa"
        translucent={false}
      />
      {renderContent()}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default App;