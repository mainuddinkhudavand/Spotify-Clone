const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('../models/Song');

dotenv.config();

const songs = require('../data/songs');


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
