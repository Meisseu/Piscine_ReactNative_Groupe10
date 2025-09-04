import SQLite from 'react-native-sqlite-storage';
import { Photo, Location, User, WeeklyProgress } from '../types';

// Activer les promesses et le debug
SQLite.enablePromise(true);
SQLite.DEBUG(true);

export class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async initDatabase(): Promise<void> {
    try {
      console.log('🗄️ Initialisation de la base de données...');
      
      this.db = await SQLite.openDatabase({
        name: 'CameraLocApp.db',
        location: 'default',
      });

      await this.createTables();
      console.log('✅ Base de données initialisée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
      throw error;
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    // Table des utilisateurs
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des photos
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp DATETIME NOT NULL,
        location_name TEXT,
        description TEXT,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Table des lieux
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        description TEXT,
        visit_goal INTEGER DEFAULT 0,
        current_visits INTEGER DEFAULT 0,
        week_start_date DATE NOT NULL,
        user_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Table de liaison photos-lieux
    await this.db.executeSql(`
      CREATE TABLE IF NOT EXISTS location_photos (
        location_id TEXT,
        photo_id TEXT,
        PRIMARY KEY (location_id, photo_id),
        FOREIGN KEY (location_id) REFERENCES locations (id),
        FOREIGN KEY (photo_id) REFERENCES photos (id)
      )
    `);

    console.log('✅ Tables créées avec succès');
  }

  // ==================== UTILISATEURS ====================
  static async createUser(email: string, password: string, name: string): Promise<User> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();

    await this.db.executeSql(
      'INSERT INTO users (id, email, password, name, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, email, password, name, createdAt]
    );

    return {
      id,
      email,
      name,
      createdAt: new Date(createdAt),
    };
  }

  static async getUserByEmailAndPassword(email: string, password: string): Promise<User | null> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const [results] = await this.db.executeSql(
      'SELECT id, email, name, created_at FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (results.rows.length === 0) {
      return null;
    }

    const row = results.rows.item(0);
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const [results] = await this.db.executeSql(
      'SELECT id, email, name, created_at FROM users WHERE email = ?',
      [email]
    );

    if (results.rows.length === 0) {
      return null;
    }

    const row = results.rows.item(0);
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: new Date(row.created_at),
    };
  }

  // ==================== PHOTOS ====================
  static async savePhoto(photo: Photo, userId: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    await this.db.executeSql(
      `INSERT INTO photos (id, uri, latitude, longitude, timestamp, location_name, description, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photo.id,
        photo.uri,
        photo.latitude,
        photo.longitude,
        photo.timestamp.toISOString(),
        photo.locationName || null,
        photo.description || null,
        userId,
      ]
    );
  }

  static async getPhotos(userId: string): Promise<Photo[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const [results] = await this.db.executeSql(
      'SELECT * FROM photos WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    );

    const photos: Photo[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      photos.push({
        id: row.id,
        uri: row.uri,
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: new Date(row.timestamp),
        locationName: row.location_name,
        description: row.description,
      });
    }

    return photos;
  }

  static async getPhotosByDate(date: Date, userId: string): Promise<Photo[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const [results] = await this.db.executeSql(
      'SELECT * FROM photos WHERE user_id = ? AND timestamp >= ? AND timestamp < ? ORDER BY timestamp DESC',
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    const photos: Photo[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      photos.push({
        id: row.id,
        uri: row.uri,
        latitude: row.latitude,
        longitude: row.longitude,
        timestamp: new Date(row.timestamp),
        locationName: row.location_name,
        description: row.description,
      });
    }

    return photos;
  }

  // ==================== LIEUX ====================
  static async saveLocation(location: Location, userId: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    await this.db.executeSql(
      `INSERT INTO locations (id, name, latitude, longitude, description, visit_goal, current_visits, week_start_date, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        location.id,
        location.name,
        location.latitude,
        location.longitude,
        location.description || null,
        location.visitGoal,
        location.currentVisits,
        location.weekStartDate.toISOString(),
        userId,
      ]
    );

    // Lier les photos au lieu
    for (const photo of location.photos) {
      await this.db.executeSql(
        'INSERT OR REPLACE INTO location_photos (location_id, photo_id) VALUES (?, ?)',
        [location.id, photo.id]
      );
    }
  }

  static async getLocations(userId: string): Promise<Location[]> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const [results] = await this.db.executeSql(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY name',
      [userId]
    );

    const locations: Location[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      
      // Récupérer les photos associées à ce lieu
      const [photoResults] = await this.db.executeSql(
        `SELECT p.* FROM photos p 
         INNER JOIN location_photos lp ON p.id = lp.photo_id 
         WHERE lp.location_id = ? ORDER BY p.timestamp DESC`,
        [row.id]
      );

      const photos: Photo[] = [];
      for (let j = 0; j < photoResults.rows.length; j++) {
        const photoRow = photoResults.rows.item(j);
        photos.push({
          id: photoRow.id,
          uri: photoRow.uri,
          latitude: photoRow.latitude,
          longitude: photoRow.longitude,
          timestamp: new Date(photoRow.timestamp),
          locationName: photoRow.location_name,
          description: photoRow.description,
        });
      }

      locations.push({
        id: row.id,
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        description: row.description,
        visitGoal: row.visit_goal,
        currentVisits: row.current_visits,
        weekStartDate: new Date(row.week_start_date),
        photos,
      });
    }

    return locations;
  }

  static async updateLocationVisit(locationId: string, photo: Photo, userId: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    // Récupérer le lieu
    const [results] = await this.db.executeSql(
      'SELECT * FROM locations WHERE id = ? AND user_id = ?',
      [locationId, userId]
    );

    if (results.rows.length === 0) {
      throw new Error('Lieu non trouvé');
    }

    const location = results.rows.item(0);
    const now = new Date();
    const weekStart = this.getWeekStart(now);

    let currentVisits = location.current_visits;
    let weekStartDate = new Date(location.week_start_date);

    // Vérifier si on est dans une nouvelle semaine
    if (weekStartDate.getTime() !== weekStart.getTime()) {
      weekStartDate = weekStart;
      currentVisits = 0;
    }

    // Incrémenter les visites
    currentVisits += 1;

    // Mettre à jour le lieu
    await this.db.executeSql(
      'UPDATE locations SET current_visits = ?, week_start_date = ? WHERE id = ?',
      [currentVisits, weekStartDate.toISOString(), locationId]
    );

    // Lier la photo au lieu
    await this.db.executeSql(
      'INSERT OR REPLACE INTO location_photos (location_id, photo_id) VALUES (?, ?)',
      [locationId, photo.id]
    );
  }

  static async getWeeklyProgress(userId: string): Promise<WeeklyProgress[]> {
    const locations = await this.getLocations(userId);
    
    return locations.map(location => ({
      locationId: location.id,
      weekStartDate: location.weekStartDate,
      targetVisits: location.visitGoal,
      actualVisits: location.currentVisits,
      completionPercentage: location.visitGoal > 0 
        ? (location.currentVisits / location.visitGoal) * 100 
        : 0
    }));
  }

  private static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    return new Date(d.setDate(diff));
  }

  // ==================== UTILITAIRES ====================
  static async clearAllUserData(userId: string): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    await this.db.transaction(async (tx) => {
      await tx.executeSql('DELETE FROM location_photos WHERE photo_id IN (SELECT id FROM photos WHERE user_id = ?)', [userId]);
      await tx.executeSql('DELETE FROM photos WHERE user_id = ?', [userId]);
      await tx.executeSql('DELETE FROM locations WHERE user_id = ?', [userId]);
    });
  }

  static async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('🗄️ Base de données fermée');
    }
  }
}
