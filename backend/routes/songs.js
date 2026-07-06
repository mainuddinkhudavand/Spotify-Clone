const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all songs (with optional search and category filters)
// @route   GET /api/songs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    const songs = await Song.find(query);
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a song by ID
// @route   GET /api/songs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a song
// @route   POST /api/songs
// @access  Private (Can extend to admin only later)
router.post('/', protect, async (req, res) => {
  const { title, artist, album, duration, audioUrl, coverUrl, category } = req.body;

  try {
    if (!title || !artist || !album || !duration || !audioUrl || !coverUrl) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const song = await Song.create({
      title,
      artist,
      album,
      duration,
      audioUrl,
      coverUrl,
      category: category || 'trending'
    });

    res.status(201).json(song);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
