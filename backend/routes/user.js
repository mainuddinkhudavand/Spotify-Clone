const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @desc    Like a song
// @route   POST /api/user/like/:songId
// @access  Private
router.post('/like/:songId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const songId = req.params.songId;
    if (user.likedSongs.includes(songId)) {
      return res.status(400).json({ message: 'Song already liked' });
    }

    user.likedSongs.push(songId);
    await user.save();

    res.json({ message: 'Song liked successfully', likedSongs: user.likedSongs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Unlike a song
// @route   POST /api/user/unlike/:songId
// @access  Private
router.post('/unlike/:songId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const songId = req.params.songId;
    user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId);
    await user.save();

    res.json({ message: 'Song unliked successfully', likedSongs: user.likedSongs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's liked songs
// @route   GET /api/user/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedSongs');
    res.json(user.likedSongs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Add song to listening history
// @route   POST /api/user/history
// @access  Private
router.post('/history', protect, async (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out existing occurrence of this song in last 20 items to avoid excessive duplicates, 
    // and push to the front of history.
    user.history = user.history.filter(item => item.song.toString() !== songId);
    
    // Add new history entry
    user.history.unshift({ song: songId, playedAt: new Date() });

    // Keep history at a maximum of 50 items
    if (user.history.length > 50) {
      user.history = user.history.slice(0, 50);
    }

    await user.save();
    res.json({ message: 'Song added to history', history: user.history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's history
// @route   GET /api/user/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'history.song',
      model: 'Song'
    });
    res.json(user.history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Clear user's listening history
// @route   DELETE /api/user/history
// @access  Private
router.delete('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.history = [];
    await user.save();

    res.json({ message: 'Listening history cleared successfully', history: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      user.email = email;
    }

    await user.save();
    
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      likedSongs: user.likedSongs,
      history: user.history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
