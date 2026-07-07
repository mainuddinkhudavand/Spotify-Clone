import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const Favorites = () => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { likedSongs, unlikeSong, token, user } = useContext(AuthContext);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredAndSortedTracks = favoriteTracks
    .filter(song => {
      const query = filterQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'dateAdded') return 0;
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'artist') {
        comparison = a.artist.localeCompare(b.artist);
      } else if (sortBy === 'album') {
        comparison = a.album.localeCompare(b.album);
      } else if (sortBy === 'duration') {
        comparison = a.duration - b.duration;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

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
    if (filteredAndSortedTracks.length > 0) {
      playSong(filteredAndSortedTracks[0], filteredAndSortedTracks);
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
            {user.username} <span className="bullet">•</span> {favoriteTracks.length} songs{filterQuery && ` (${filteredAndSortedTracks.length} matches)`}
          </span>
        </div>
      </div>

      {loading ? (
        <p style={{ opacity: 0.6 }}>Loading favorites...</p>
      ) : favoriteTracks.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1rem 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div className="search-container" style={{ margin: 0, height: '40px', width: '240px', backgroundColor: '#242424' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search in Liked Songs"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  style={{ width: '80%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                />
              </div>

              {/* Sort By Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    backgroundColor: '#242424',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="dateAdded">Date Added</option>
                  <option value="title">Title</option>
                  <option value="artist">Artist</option>
                  <option value="album">Album</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* Sort Order Button */}
              {sortBy !== 'dateAdded' && (
                <button 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    backgroundColor: '#242424',
                    color: '#fff',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem'
                  }}
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? (
                    <i className="fa-solid fa-arrow-up-a-z"></i>
                  ) : (
                    <i className="fa-solid fa-arrow-down-z-a"></i>
                  )}
                </button>
              )}
            </div>
          </div>

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
              {filteredAndSortedTracks.map((song, index) => {
                const isSongPlaying = currentSong && currentSong._id === song._id && isPlaying;
                const isSongActive = currentSong && currentSong._id === song._id;

                return (
                  <tr 
                    key={song._id} 
                    className={`songs-table-row ${isSongActive ? 'active' : ''}`}
                    onDoubleClick={() => playSong(song, filteredAndSortedTracks)}
                  >
                    <td className="songs-table-index" onClick={() => playSong(song, filteredAndSortedTracks)}>
                      {index + 1}
                    </td>
                    <td className="songs-table-play-icon" onClick={() => playSong(song, filteredAndSortedTracks)}>
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
