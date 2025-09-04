require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('crypto');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité et performance
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accepter seulement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Servir les fichiers statiques (images)
app.use('/uploads', express.static(uploadsDir));

// Fonction utilitaire pour générer un UUID simple
function generateUUID() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// =================== ROUTES AUTH ===================

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Email, mot de passe et nom requis' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await database.get(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // Créer l'utilisateur
    const userId = generateUUID();
    await database.run(
      'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)',
      [userId, email, name, password] // En production, hasher le mot de passe !
    );

    const user = await database.get(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    const user = await database.get(
      'SELECT id, email, name, created_at FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    res.json({
      message: 'Connexion réussie',
      user
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =================== ROUTES PHOTOS ===================

// Upload d'une photo
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune photo fournie' });
    }

    const { latitude, longitude, locationName, userId, timestamp } = req.body;

    if (!latitude || !longitude || !userId) {
      return res.status(400).json({ 
        error: 'Latitude, longitude et userId requis' 
      });
    }

    const photoId = generateUUID();
    const photoData = {
      id: photoId,
      filename: req.file.filename,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size: req.file.size,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: locationName || null,
      timestamp: timestamp || new Date().toISOString(),
      user_id: userId
    };

    await database.run(
      `INSERT INTO photos (id, filename, original_name, mime_type, size, 
       latitude, longitude, location_name, timestamp, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photoData.id, photoData.filename, photoData.original_name,
        photoData.mime_type, photoData.size, photoData.latitude,
        photoData.longitude, photoData.location_name, 
        photoData.timestamp, photoData.user_id
      ]
    );

    // Retourner les données avec l'URL complète
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(201).json({
      message: 'Photo uploadée avec succès',
      photo: {
        ...photoData,
        url: photoUrl
      }
    });

  } catch (error) {
    console.error('❌ Erreur upload photo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les photos d'un utilisateur
app.get('/api/photos/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const photos = await database.all(
      'SELECT * FROM photos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Ajouter l'URL complète à chaque photo
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `${req.protocol}://${req.get('host')}/uploads/${photo.filename}`
    }));

    res.json({
      photos: photosWithUrls
    });

  } catch (error) {
    console.error('❌ Erreur récupération photos:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une photo
app.delete('/api/photos/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // Récupérer les infos de la photo pour supprimer le fichier
    const photo = await database.get(
      'SELECT filename FROM photos WHERE id = ?',
      [photoId]
    );

    if (!photo) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    // Supprimer le fichier physique
    const filePath = path.join(uploadsDir, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Supprimer de la base de données
    await database.run('DELETE FROM photos WHERE id = ?', [photoId]);

    res.json({ message: 'Photo supprimée avec succès' });

  } catch (error) {
    console.error('❌ Erreur suppression photo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =================== ROUTES LIEUX ===================

// Créer ou mettre à jour un lieu
app.post('/api/locations', async (req, res) => {
  try {
    const { name, visitGoal, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ 
        error: 'Nom du lieu et userId requis' 
      });
    }

    const locationId = generateUUID();
    const currentDate = new Date();
    const weekStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());

    await database.run(
      `INSERT INTO locations (id, name, visit_goal, current_visits, week_start, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [locationId, name, visitGoal || 0, 0, weekStart.toISOString(), userId]
    );

    const location = await database.get(
      'SELECT * FROM locations WHERE id = ?',
      [locationId]
    );

    res.status(201).json({
      message: 'Lieu créé avec succès',
      location
    });

  } catch (error) {
    console.error('❌ Erreur création lieu:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer les lieux d'un utilisateur
app.get('/api/locations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const locations = await database.all(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      locations
    });

  } catch (error) {
    console.error('❌ Erreur récupération lieux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// =================== ROUTES SYSTÈME ===================

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: '📷 Camera Loc Backend API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'POST /api/photos',
      'GET /api/photos/:userId',
      'DELETE /api/photos/:photoId',
      'POST /api/locations',
      'GET /api/locations/:userId',
      'GET /api/health'
    ]
  });
});

// Gestion d'erreur globale
app.use((error, req, res, next) => {
  console.error('❌ Erreur non gérée:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Fichier trop volumineux (max 10MB)' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Erreur serveur interne' 
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvée' 
  });
});

// Démarrage du serveur
async function startServer() {
  try {
    await database.init();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📱 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🖼️  Uploads disponibles sur http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await database.close();
  process.exit(0);
});

startServer();
