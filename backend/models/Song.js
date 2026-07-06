const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  album: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number, // duration in seconds
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['recently-played', 'trending', 'featured', 'popular'],
    default: 'trending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);
