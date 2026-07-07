import React, { useContext, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const History = () => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { history, likedSongs, likeSong, unlikeSong, user, clearHistory } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    if (!item.song) return false;
    const query = searchQuery.toLowerCase();
    return (
      item.song.title.toLowerCase().includes(query) ||
      item.song.artist.toLowerCase().includes(query) ||
      item.song.album.toLowerCase().includes(query)
    );
  });

  const historySongs = filteredHistory.map(item => item.song);

  const formatDuration = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleLikeToggle = (songId) => {
    if (!user) return;
    if (likedSongs.includes(songId)) {
      unlikeSong(songId);
    } else {
      likeSong(songId);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
        <h2 style={{ margin: 0 }}>Listening History</h2>
        <p style={{ opacity: 0.6, marginTop: '0.5rem', textAlign: 'center' }}>Log in to track your recently played tracks and pick up right where you left off.</p>
      </div>
    );
  }

  // extract actual song list from history items to play them sequentially
  const historySongs = history.filter(item => item.song).map(item => item.song);

  return (
    <div>
      <div className="details-header" style={{
        background: 'linear-gradient(to bottom, #333333, rgba(18,18,18,0.9))',
        margin: '-1rem -1.5rem 1rem -1.5rem',
        padding: '2.5rem 1.5rem 1.5rem 1.5rem'
      }}>
        <div style={{
          width: '192px',
          height: '192px',
          borderRadius: '4px',
          background: 'linear-gradient(135deg, #555, #111)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '4.5rem', color: '#b3b3b3' }}></i>
        </div>
        <div className="details-metadata">
          <span className="details-type">Activity</span>
          <span className="details-title">Listening History</span>
          <span className="details-description">Keep track of your recently played songs.</span>
          <span className="details-stats">
            {user.username} <span className="bullet">•</span> {history.length} songs recently played{searchQuery && ` (${filteredHistory.length} matches)`}
          </span>
        </div>
      </div>

      {history.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', padding: '1rem 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {historySongs.length > 0 && (
                <button 
                  onClick={() => playSong(historySongs[0], historySongs)}
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
              <button 
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your listening history?")) {
                    clearHistory();
                  }
                }}
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
                Clear History
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Search Bar */}
              <div className="search-container" style={{ margin: 0, height: '40px', width: '240px', backgroundColor: '#242424' }}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search in history"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '80%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <table className="songs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Album</th>
                <th>Played At</th>
                <th style={{ textAlign: 'center' }}><i className="fa-regular fa-clock"></i></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, index) => {
                const song = item.song;
                if (!song) return null;

              const isSongPlaying = currentSong && currentSong._id === song._id && isPlaying;
              const isSongActive = currentSong && currentSong._id === song._id;
              const isLiked = likedSongs.includes(song._id);
              const playedTime = new Date(item.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const playedDate = new Date(item.playedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <tr 
                  key={`${item._id || index}`} 
                  className={`songs-table-row ${isSongActive ? 'active' : ''}`}
                  onDoubleClick={() => playSong(song, historySongs)}
                >
                  <td className="songs-table-index" onClick={() => playSong(song, historySongs)}>
                    {index + 1}
                  </td>
                  <td className="songs-table-play-icon" onClick={() => playSong(song, historySongs)}>
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
                  <td style={{ color: '#b3b3b3' }}>{playedDate} at {playedTime}</td>
                  <td className="songs-table-duration">
                    {formatDuration(song.duration)}
                  </td>
                  <td>
                    <button className="songs-table-like-btn" onClick={() => handleLikeToggle(song._id)}>
                      {isLiked ? (
                        <i className="fa-solid fa-heart liked"></i>
                      ) : (
                        <i className="fa-regular fa-heart"></i>
                      )}
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
          <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>No recently played songs found. Play some music to start tracking history!</p>
        </div>
      )}
    </div>
  );
};

export default History;
