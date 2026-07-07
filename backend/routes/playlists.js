const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user's playlists & public playlists
// @route   GET /api/playlists
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({
      $or: [
        { creator: req.user.id },
        { isPublic: true }
      ]
    }).populate('creator', 'username');
    
    res.json(playlists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a playlist
// @route   POST /api/playlists
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description, coverUrl, isPublic } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Playlist title is required' });
    }

    const playlist = await Playlist.create({
      title,
      description: description || '',
      coverUrl: coverUrl || undefined,
      creator: req.user.id,
      isPublic: isPublic || false,
      songs: req.body.songs || []
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get playlist by ID
// @route   GET /api/playlists/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs')
      .populate('creator', 'username');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Access check: must be owner or public
    if (playlist.creator._id.toString() !== req.user.id && !playlist.isPublic) {
      return res.status(403).json({ message: 'Not authorized to view this playlist' });
    }

    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update playlist details or add/remove song
// @route   PUT /api/playlists/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, coverUrl, isPublic, songId, action } = req.body;

  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify ownership
    if (playlist.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Handle updates to playlist metadata
    if (title !== undefined) playlist.title = title;
    if (description !== undefined) playlist.description = description;
    if (coverUrl !== undefined) playlist.coverUrl = coverUrl;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    // Handle adding/removing songs
    if (songId) {
      if (action === 'add') {
        if (!playlist.songs.includes(songId)) {
          playlist.songs.push(songId);
        }
      } else if (action === 'remove') {
        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
      }
    }

    await playlist.save();
    
    // Return the updated, populated playlist
    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Verify ownership
    if (playlist.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await playlist.deleteOne();
    res.json({ message: 'Playlist removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
