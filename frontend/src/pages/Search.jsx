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

  const mockArtists = [
    { name: "David Kushner", genres: "Indie Pop, Folk", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
    { name: "Lofi Dreamer", genres: "Chillhop, Lofi", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
    { name: "Ocean Breeze", genres: "Ambient, Chillout", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
    { name: "Synthwave Rider", genres: "Retro Synth, Electronic", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
    { name: "Quiet Hours", genres: "Acoustic, Instrumental", img: "https://images.unsplash.com/photo-1489980508314-941910ded1f4?q=80&w=200&auto=format&fit=crop" }
  ];

  const mockPlaylists = [
    { title: "Chill & Coding Vibes", desc: "Best ambient tunes for writing code.", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop" },
    { title: "Focus & Chillout", desc: "Lofi and retro wave rhythms.", img: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=200&auto=format&fit=crop" },
    { title: "Rock Classics", desc: "The greatest stadium rock hits.", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=200&auto=format&fit=crop" }
  ];

  const matchedArtists = searchQuery 
    ? mockArtists.filter(art => art.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const matchedPlaylists = searchQuery 
    ? mockPlaylists.filter(pl => pl.title.toLowerCase().includes(searchQuery.toLowerCase()) || pl.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

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

      {searchQuery && (matchedArtists.length > 0 || matchedPlaylists.length > 0) && (
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {matchedArtists.length > 0 && (
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2>Artists</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {matchedArtists.map((artist, idx) => (
                  <div key={idx} className="card" style={{ width: '160px', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }} onClick={() => setSearchQuery(artist.name)}>
                    <div className="card-img-wrapper" style={{ borderRadius: '50%', overflow: 'hidden', width: '120px', height: '120px', margin: '0 auto 0.75rem auto' }}>
                      <img 
                        src={artist.img} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt="" 
                      />
                    </div>
                    <p className="card-title" style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{artist.name}</p>
                    <p className="card-info" style={{ fontSize: '0.7rem', opacity: 0.6, margin: 0 }}>{artist.genres}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedPlaylists.length > 0 && (
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h2>Playlists</h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {matchedPlaylists.map((pl, idx) => (
                  <div key={idx} className="card" style={{ width: '160px', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <div className="card-img-wrapper" style={{ borderRadius: '4px', overflow: 'hidden', width: '120px', height: '120px', margin: '0 auto 0.75rem auto' }}>
                      <img 
                        src={pl.img} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt="" 
                      />
                    </div>
                    <p className="card-title" style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>{pl.title}</p>
                    <p className="card-info" style={{ fontSize: '0.7rem', opacity: 0.6, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <h2>Songs</h2>
      
      {loading ? (
        <p style={{ opacity: 0.6 }}>Searching...</p>
      ) : songs.length > 0 ? (
        <table className="songs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th className="songs-table-album">Album</th>
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
