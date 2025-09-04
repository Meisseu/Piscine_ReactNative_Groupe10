const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.DB_PATH || './database.sqlite';
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Erreur connexion base de données:', err);
          reject(err);
        } else {
          console.log('✅ Connecté à la base de données SQLite');
          resolve();
        }
      });
    });
  }

  async init() {
    await this.connect();
    await this.createTables();
  }

  async createTables() {
    const tables = [
      // Table des utilisateurs
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Table des photos
      `CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT,
        mime_type TEXT,
        size INTEGER,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        location_name TEXT,
        timestamp DATETIME NOT NULL,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      // Table des lieux
      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        visit_goal INTEGER DEFAULT 0,
        current_visits INTEGER DEFAULT 0,
        week_start DATE,
        user_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      
      // Table de liaison photos-lieux
      `CREATE TABLE IF NOT EXISTS location_photos (
        id TEXT PRIMARY KEY,
        location_id TEXT,
        photo_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id),
        FOREIGN KEY (photo_id) REFERENCES photos(id)
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
    
    console.log('✅ Tables créées avec succès');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Erreur SQL:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error('❌ Erreur SQL:', err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Erreur SQL:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ Erreur fermeture base:', err);
          } else {
            console.log('✅ Base de données fermée');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
