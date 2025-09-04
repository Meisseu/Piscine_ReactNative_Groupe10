import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const USERS_KEY = '@users';
const CURRENT_USER_KEY = '@current_user';

export class AuthService {
  static async register(email: string, password: string, name: string): Promise<User> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUsers = await this.getUsers();
      const userExists = existingUsers.find(user => user.email === email);
      
      if (userExists) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer un nouvel utilisateur
      const newUser: User = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email,
        name,
        createdAt: new Date(),
      };

      // Sauvegarder le mot de passe (en production, il faudrait le hasher)
      const userWithPassword = { ...newUser, password };
      
      // Ajouter aux utilisateurs existants
      const updatedUsers = [...existingUsers, userWithPassword];
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      
      // Connecter l'utilisateur automatiquement
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const users = await this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Connecter l'utilisateur
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  private static async getUsers(): Promise<any[]> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }
}
