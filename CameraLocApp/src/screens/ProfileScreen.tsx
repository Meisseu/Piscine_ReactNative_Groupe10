import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { AuthService } from '../services/AuthService';
import { StorageService } from '../services/StorageService';
import { User } from '../types';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stats, setStats] = useState<{ photos: number; locations: number }>({ photos: 0, locations: 0 });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const current = await AuthService.getCurrentUser();
    setUser(current);
    setName(current?.name || '');
    setEmail(current?.email || '');
    const [photos, locations] = await Promise.all([StorageService.getPhotos(), StorageService.getLocations()]);
    setStats({ photos: photos.length, locations: locations.length });
  };

  const onSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    try {
      const updated = await AuthService.updateProfile({ name: name.trim(), email: email.trim(), password: password || undefined });
      setUser(updated);
      setPassword('');
      setConfirmPassword('');
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    }
  };

  const onLogout = async () => {
    await AuthService.logout();
    Alert.alert('Déconnexion', 'Redémarrez l’application pour revenir à l’écran d’authentification.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>👤 Profil</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editBtnText}>{isEditing ? 'Annuler' : 'Modifier'}</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Votre nom" />
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Votre email" autoCapitalize="none" />
            <Text style={styles.inputLabel}>Nouveau mot de passe (optionnel)</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Laisser vide pour ne pas changer" secureTextEntry />
            {password ? (
              <>
                <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
                <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmez" secureTextEntry />
              </>
            ) : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
              <Text style={styles.primaryBtnText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.photos}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.locations}</Text>
            <Text style={styles.statLabel}>Lieux</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={onLogout}>
          <Text style={styles.dangerBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3498db', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  email: { fontSize: 14, color: '#7f8c8d' },
  editBtn: { backgroundColor: '#3498db', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  editBtnText: { color: '#fff', fontWeight: 'bold' },
  inputLabel: { fontSize: 14, color: '#3498db', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, backgroundColor: '#f8f9fa' },
  primaryBtn: { backgroundColor: '#27ae60', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#3498db' },
  statLabel: { fontSize: 12, color: '#7f8c8d' },
  dangerBtn: { backgroundColor: '#e74c3c', borderRadius: 10, padding: 14, alignItems: 'center' },
  dangerBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default ProfileScreen;


