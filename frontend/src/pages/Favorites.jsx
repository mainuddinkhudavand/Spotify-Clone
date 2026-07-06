import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const Favorites = () => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { likedSongs, unlikeSong, token, user } = useContext(AuthContext);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchFavorites();
  }, [likedSongs, token]);

  const fetchFavorites = async () => {
    if (!token) {
      setFavoriteTracks([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFavoriteTracks(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      playSong(favoriteTracks[0], favoriteTracks);
    }
  };

  const formatDuration = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
        <i className="fa-solid fa-heart-crack" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
        <h2 style={{ margin: 0 }}>Liked Songs Library</h2>
        <p style={{ opacity: 0.6, marginTop: '0.5rem', textAlign: 'center' }}>Log in to see all your favorite tracks and start building your library.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="details-header" style={{
        background: 'linear-gradient(to bottom, #450af5, rgba(18,18,18,0.9))',
        margin: '-1rem -1.5rem 1rem -1.5rem',
        padding: '2.5rem 1.5rem 1.5rem 1.5rem'
      }}>
        <div style={{
          width: '192px',
          height: '192px',
          borderRadius: '4px',
          background: 'linear-gradient(135deg, #450af5, #c4efd9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>
          <i className="fa-solid fa-heart" style={{ fontSize: '4.5rem', color: '#fff' }}></i>
        </div>
        <div className="details-metadata">
          <span className="details-type">Playlist</span>
          <span className="details-title">Liked Songs</span>
          <span className="details-description">Your personal collection of saved music tracks.</span>
          <span className="details-stats">
            {user.username} <span className="bullet">•</span> {favoriteTracks.length} songs
          </span>
        </div>
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading favorites...</p>
      ) : favoriteTracks.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
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
          </div>

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
              {favoriteTracks.map((song, index) => {
                const isSongPlaying = currentSong && currentSong._id === song._id && isPlaying;
                const isSongActive = currentSong && currentSong._id === song._id;

                return (
                  <tr 
                    key={song._id} 
                    className={`songs-table-row ${isSongActive ? 'active' : ''}`}
                    onDoubleClick={() => playSong(song, favoriteTracks)}
                  >
                    <td className="songs-table-index" onClick={() => playSong(song, favoriteTracks)}>
                      {index + 1}
                    </td>
                    <td className="songs-table-play-icon" onClick={() => playSong(song, favoriteTracks)}>
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
                      <button className="songs-table-like-btn" onClick={() => unlikeSong(song._id)}>
                        <i className="fa-solid fa-heart liked"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>Songs you like will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
