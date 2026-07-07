import React, { useState, useEffect, useContext, useRef } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const Playlists = ({ playlistId, setActiveTab, onPlaylistsUpdated }) => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { token, user, likedSongs, likeSong, unlikeSong } = useContext(AuthContext);

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          isPublic: editIsPublic
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPlaylist(data);
        setShowEditModal(false);
        if (onPlaylistsUpdated) {
          onPlaylistsUpdated();
        }
      } else {
        alert("Failed to update playlist");
      }
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const API_URL = 'http://localhost:5000/api';
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchPlaylistDetails();
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [playlistId, token]);

  const fetchPlaylistDetails = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data);
      } else {
        console.error("Failed to fetch playlist details");
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleLikeToggle = (songId) => {
    if (likedSongs.includes(songId)) {
      unlikeSong(songId);
    } else {
      likeSong(songId);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          songId,
          action: 'remove'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data);
        setActiveDropdown(null);
      }
    } catch (error) {
      console.error("Error removing song from playlist:", error);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onPlaylistsUpdated();
        setActiveTab('home');
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const formatDuration = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ opacity: 0.6 }}>Loading playlist details...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ opacity: 0.6 }}>Playlist not found or access denied.</p>
      </div>
    );
  }

  const isOwner = user && (playlist.creator?._id === user._id || playlist.creator === user._id);

  return (
    <div>
      <div className="details-header" style={{
        background: 'linear-gradient(to bottom, #232323, rgba(18,18,18,0.9))',
        margin: '-1rem -1.5rem 1rem -1.5rem',
        padding: '2.5rem 1.5rem 1.5rem 1.5rem'
      }}>
        <img src={playlist.coverUrl || 'assets/card3img.jpeg'} className="details-cover" alt={playlist.title} />
        <div className="details-metadata">
          <span className="details-type">{playlist.isPublic ? 'Public Playlist' : 'Private Playlist'}</span>
          <span className="details-title">{playlist.title}</span>
          <span className="details-description">{playlist.description || 'No description provided.'}</span>
          <span className="details-stats">
            {playlist.creator?.username || 'User'} <span className="bullet">•</span> {playlist.songs?.length || 0} songs
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {playlist.songs?.length > 0 && (
            <button 
              onClick={handlePlayAll}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#1ed760',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className="fa-solid fa-play" style={{ color: '#000', fontSize: '1.5rem', marginLeft: '5px' }}></i>
            </button>
          )}
        </div>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                setEditTitle(playlist.title);
                setEditDesc(playlist.description || '');
                setEditIsPublic(playlist.isPublic || false);
                setShowEditModal(true);
              }}
              style={{
                background: 'transparent',
                border: '1px solid #b3b3b3',
                color: '#fff',
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Edit Details
            </button>
            <button 
              onClick={handleDeletePlaylist}
              style={{
                background: 'transparent',
                border: '1px solid #ff4d4d',
                color: '#ff4d4d',
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Delete Playlist
            </button>
          </div>
        )}
      </div>

      {playlist.songs?.length > 0 ? (
        <table className="songs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Album</th>
              <th style={{ textAlign: 'center' }}><i className="fa-regular fa-clock"></i></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {playlist.songs.map((song, index) => {
              const isSongPlaying = currentSong && currentSong._id === song._id && isPlaying;
              const isSongActive = currentSong && currentSong._id === song._id;
              const isLiked = likedSongs.includes(song._id);

              return (
                <tr 
                  key={song._id} 
                  className={`songs-table-row ${isSongActive ? 'active' : ''}`}
                  onDoubleClick={() => playSong(song, playlist.songs)}
                >
                  <td className="songs-table-index" onClick={() => playSong(song, playlist.songs)}>
                    {index + 1}
                  </td>
                  <td className="songs-table-play-icon" onClick={() => playSong(song, playlist.songs)}>
                    {isSongPlaying ? (
                      <i className="fa-solid fa-pause"></i>
                    ) : (
                      <i className="fa-solid fa-play"></i>
                    )}
                  </td>
                  <td>
                    <div className="songs-table-track-info">
                      <img src={song.coverUrl} className="songs-table-cover" alt="" />
                      <div className="songs-table-details">
                        <span className="songs-table-title">{song.title}</span>
                        <span className="songs-table-artist">{song.artist}</span>
                      </div>
                    </div>
                  </td>
                  <td className="songs-table-album">{song.album}</td>
                  <td className="songs-table-duration">
                    {formatDuration(song.duration)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button className="songs-table-like-btn" onClick={() => handleLikeToggle(song._id)}>
                        {isLiked ? (
                          <i className="fa-solid fa-heart liked"></i>
                        ) : (
                          <i className="fa-regular fa-heart"></i>
                        )}
                      </button>
                      
                      {isOwner && (
                        <div className="track-action-menu" ref={activeDropdown === song._id ? dropdownRef : null}>
                          <button 
                            className="track-action-btn"
                            onClick={() => setActiveDropdown(activeDropdown === song._id ? null : song._id)}
                          >
                            <i className="fa-solid fa-ellipsis"></i>
                          </button>
                          
                          {activeDropdown === song._id && (
                            <div className="dropdown-menu">
                              <button 
                                className="dropdown-item"
                                onClick={() => handleRemoveSong(song._id)}
                                style={{ color: '#ff4d4d' }}
                              >
                                <i className="fa-solid fa-trash"></i> Remove from Playlist
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>This playlist is empty. Go search and add songs!</p>
          <button 
            className="badge" 
            style={{ marginTop: '1rem' }}
            onClick={() => setActiveTab('search')}
          >
            Search Songs
          </button>
        </div>
      )}
      {/* Edit Playlist Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Edit Playlist Details</h3>
            <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Playlist Name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Add a description"
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="editIsPublic"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="editIsPublic" style={{ cursor: 'pointer', userSelect: 'none', margin: 0, fontSize: '0.85rem' }}>Make Public</label>
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn modal-btn-submit">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
