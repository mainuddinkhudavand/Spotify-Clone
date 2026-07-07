const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection helper with in-memory fallback
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spotify_clone';
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.warn('\n⚠️  MongoDB connection failed. Starting in-memory MongoDB fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      console.log(`🚀 In-Memory MongoDB Server running at: ${inMemoryUri}`);
      
      await mongoose.connect(inMemoryUri);
      console.log('Connected to In-Memory MongoDB successfully.');

      // Auto-seed in-memory database
      const Song = require('./models/Song');
      const songCount = await Song.countDocuments();
      if (songCount === 0) {
        console.log('Database is empty. Seeding initial songs...');
        const songsList = require('./data/songs');
        await Song.insertMany(songsList);
        console.log(`Seeded ${songsList.length} songs successfully!`);
      }
    } catch (memErr) {
      console.error('CRITICAL: Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }
};

connectDB();

// Root route
app.get('/', (req, res) => {
  res.send('Spotify Clone Backend API is running...');
});

// Import routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');
const userRoutes = require('./routes/user');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/user', userRoutes);

// Port setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
