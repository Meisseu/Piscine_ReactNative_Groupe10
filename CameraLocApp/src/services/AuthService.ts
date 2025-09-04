import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { DatabaseService } from './DatabaseService';

const CURRENT_USER_KEY = '@current_user';

export class AuthService {
  static async initialize(): Promise<void> {
    try {
      await DatabaseService.initDatabase();
      console.log('✅ AuthService initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation d\'AuthService:', error);
      throw error;
    }
  }

  static async register(email: string, password: string, name: string): Promise<User> {
    try {
      console.log('📝 Tentative d\'inscription:', { email, name });

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await DatabaseService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer un nouvel utilisateur dans la base de données
      const newUser = await DatabaseService.createUser(email, password, name);
      
      // Connecter l'utilisateur automatiquement
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
      console.log('✅ Utilisateur créé et connecté:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      console.log('🔐 Tentative de connexion:', { email });

      const user = await DatabaseService.getUserByEmailAndPassword(email, password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Connecter l'utilisateur
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      console.log('✅ Utilisateur connecté:', user.id);
      return user;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      console.log('✅ Utilisateur déconnecté');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        // Convertir la date string en objet Date
        user.createdAt = new Date(user.createdAt);
        return user;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  static async deleteAccount(): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Aucun utilisateur connecté');
      }

      // Supprimer toutes les données de l'utilisateur
      await DatabaseService.clearAllUserData(currentUser.id);
      
      // Déconnecter l'utilisateur
      await this.logout();
      
      console.log('✅ Compte supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      throw error;
    }
  }
}