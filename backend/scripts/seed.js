const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('../models/Song');

dotenv.config();

const songs = [
  {
    title: "Daylight",
    artist: "David Kushner",
    album: "Daylight Single",
    duration: 213, // 3:33
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    category: "recently-played"
  },
  {
    title: "Lost in the City",
    artist: "Lofi Dreamer",
    album: "Urban Chillout",
    duration: 302, // 5:02
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
    category: "trending"
  },
  {
    title: "Summer Vibes",
    artist: "Ocean Breeze",
    album: "Sunny Side Up",
    duration: 344, // 5:44
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop",
    category: "trending"
  },
  {
    title: "Midnight City",
    artist: "Synthwave Echo",
    album: "Neon Dreams",
    duration: 302, // 5:02
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    category: "trending"
  },
  {
    title: "Warm Breeze",
    artist: "Lofi Chill",
    album: "Rainy Afternoon",
    duration: 243, // 4:03
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    category: "recently-played"
  },
  {
    title: "Deep Blue",
    artist: "Oceanic Sounds",
    album: "Underwater Echoes",
    duration: 312, // 5:12
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop",
    category: "featured"
  },
  {
    title: "Top Songs-India",
    artist: "Classical Fusion",
    album: "Ragas & Beats",
    duration: 256, // 4:16
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
    category: "featured"
  },
  {
    title: "Guitar Chillout",
    artist: "Acoustic Sunset",
    album: "Campfire Sessions",
    duration: 278, // 4:38
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverUrl: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop",
    category: "featured"
  }
];

const seedDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spotify_clone';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding...');
    
    // Clear existing songs
    await Song.deleteMany({});
    console.log('Cleared existing songs.');

    // Insert new songs
    const createdSongs = await Song.insertMany(songs);
    console.log(`Seeded ${createdSongs.length} songs successfully!`);
    
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();
