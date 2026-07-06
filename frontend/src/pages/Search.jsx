import React, { useState, useEffect, useContext, useRef } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const Search = () => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { likedSongs, likeSong, unlikeSong, user, token } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Song ID of open dropdown

  const API_URL = 'http://localhost:5000/api';
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSongs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    fetchPlaylists();
    
    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [token]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/songs?search=${searchQuery}`);
      if (res.ok) {
        const data = await res.json();
        setSongs(data);
      }
    } catch (error) {
      console.error('Error fetching searched songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/playlists`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.filter(pl => pl.creator?._id === user?._id || pl.creator === user?._id));
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const formatDuration = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSongPlay = (song) => {
    playSong(song, songs);
  };

  const handleLikeToggle = (songId) => {
    if (!user) {
      alert("Log in to save songs to your library!");
      return;
    }
    if (likedSongs.includes(songId)) {
      unlikeSong(songId);
    } else {
      likeSong(songId);
    }
  };

  const handleAddToPlaylist = async (playlistId, songId) => {
    try {
      const res = await fetch(`${API_URL}/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          songId,
          action: 'add'
        })
      });
      if (res.ok) {
        alert("Added to playlist successfully!");
        setActiveDropdown(null);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to add song");
      }
    } catch (error) {
      console.error("Error adding to playlist:", error);
    }
  };

  return (
    <div>
      <div className="sticky-nav" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <h2>Search Results</h2>
      
      {loading ? (
        <p style={{ opacity: 0.6 }}>Searching...</p>
      ) : songs.length > 0 ? (
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
            {songs.map((song, index) => {
              const isSongPlaying = currentSong && currentSong._id === song._id && isPlaying;
              const isSongActive = currentSong && currentSong._id === song._id;
              const isLiked = likedSongs.includes(song._id);

              return (
                <tr 
                  key={song._id} 
                  className={`songs-table-row ${isSongActive ? 'active' : ''}`}
                  onDoubleClick={() => handleSongPlay(song)}
                >
                  <td className="songs-table-index" onClick={() => handleSongPlay(song)}>
                    {index + 1}
                  </td>
                  <td className="songs-table-play-icon" onClick={() => handleSongPlay(song)}>
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
                      
                      {user && (
                        <div className="track-action-menu" ref={activeDropdown === song._id ? dropdownRef : null}>
                          <button 
                            className="track-action-btn"
                            onClick={() => setActiveDropdown(activeDropdown === song._id ? null : song._id)}
                          >
                            <i className="fa-solid fa-ellipsis"></i>
                          </button>
                          
                          {activeDropdown === song._id && (
                            <div className="dropdown-menu">
                              <span style={{ fontSize: '0.7rem', color: '#b3b3b3', padding: '0.4rem 1rem', display: 'block' }}>Add to Playlist:</span>
                              {playlists.length > 0 ? (
                                playlists.map(pl => (
                                  <button 
                                    key={pl._id}
                                    className="dropdown-item"
                                    onClick={() => handleAddToPlaylist(pl._id, song._id)}
                                  >
                                    <i className="fa-solid fa-music"></i> {pl.title}
                                  </button>
                                ))
                              ) : (
                                <span style={{ fontSize: '0.75rem', padding: '0.4rem 1rem', opacity: 0.6 }}>No playlists found</span>
                              )}
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
        <p style={{ opacity: 0.6 }}>No songs found matching your search.</p>
      )}
    </div>
  );
};

export default Search;
