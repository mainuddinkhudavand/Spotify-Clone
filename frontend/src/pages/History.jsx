import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const History = () => {
  const { playSong, currentSong, isPlaying } = useContext(PlayerContext);
  const { history, likedSongs, likeSong, unlikeSong, user } = useContext(AuthContext);

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
          justifycontent: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
        }}>
          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '4.5rem', color: '#b3b3b3' }}></i>
        </div>
        <div className="details-metadata">
          <span className="details-type">Activity</span>
          <span className="details-title">Listening History</span>
          <span className="details-description">Keep track of your recently played songs.</span>
          <span className="details-stats">
            {user.username} <span className="bullet">•</span> {history.length} songs recently played
          </span>
        </div>
      </div>

      {history.length > 0 ? (
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
            {history.map((item, index) => {
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
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ opacity: 0.6, fontSize: '0.95rem' }}>No recently played songs found. Play some music to start tracking history!</p>
        </div>
      )}
    </div>
  );
};

export default History;
