import React, { useContext, useState } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const MusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    playSong,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    setVolume,
    isShuffle,
    isRepeat,
    setIsShuffle,
    setIsRepeat
  } = useContext(PlayerContext);

  const { likedSongs, likeSong, unlikeSong, user } = useContext(AuthContext);
  const [showLyrics, setShowLyrics] = useState(false);

  const getMockLyrics = (title, artist) => {
    return [
      `[Verse 1]`,
      `Singing along to "${title}"`,
      `Underneath the midnight sky`,
      `With ${artist} playing soft and slow`,
      `As the hours keep passing by`,
      ``,
      `[Chorus]`,
      `Oh, this melody is sweet`,
      `Moving right down to our feet`,
      `Listening to the rhythm beat`,
      `Making this moment complete`,
      ``,
      `[Verse 2]`,
      `A Spotify clone made with care`,
      `Beautiful music in the air`,
      `Sharing notes from here to there`,
      `With coding magic everywhere`
    ];
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!currentSong) {
    return (
      <div className="music-player" style={{ justifyContent: 'center' }}>
        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Select a song to start streaming</p>
      </div>
    );
  }

  const isLiked = likedSongs.includes(currentSong._id);

  const handleLikeToggle = () => {
    if (!user) {
      alert("Log in to save songs to your library!");
      return;
    }
    if (isLiked) {
      unlikeSong(currentSong._id);
    } else {
      likeSong(currentSong._id);
    }
  };

  const handleProgressChange = (e) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="music-player">
      {/* Current Album Cover Info */}
      <div className="album">
        <img src={currentSong.coverUrl} className="current-album" alt={currentSong.title} />
        <div className="album-details">
          <span className="album-title">{currentSong.title}</span>
          <span className="album-artist">{currentSong.artist}</span>
        </div>
        <button 
          className={`album-like-icon ${isLiked ? 'liked' : ''}`}
          onClick={handleLikeToggle}
        >
          {isLiked ? (
            <i className="fa-solid fa-heart"></i>
          ) : (
            <i className="fa-regular fa-heart"></i>
          )}
        </button>
      </div>

      {/* Main Playback Bar & Buttons */}
      <div className="player">
        <div className="player-controls">
          <button 
            className={`player-control-icon ${isShuffle ? 'active' : ''}`}
            onClick={() => setIsShuffle(!isShuffle)}
            title="Shuffle"
          >
            <i className="fa-solid fa-shuffle"></i>
          </button>
          
          <button className="player-control-icon" onClick={previousTrack} title="Previous">
            <i className="fa-solid fa-backward-step"></i>
          </button>
          
          <button className="play-pause-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <i className="fa-solid fa-pause"></i>
            ) : (
              <i className="fa-solid fa-play" style={{ marginLeft: '2px' }}></i>
            )}
          </button>
          
          <button className="player-control-icon" onClick={nextTrack} title="Next">
            <i className="fa-solid fa-forward-step"></i>
          </button>
          
          <button 
            className={`player-control-icon ${isRepeat ? 'active' : ''}`}
            onClick={() => setIsRepeat(!isRepeat)}
            title="Repeat"
          >
            <i className="fa-solid fa-repeat"></i>
          </button>
        </div>

        <div className="playback-bar">
          <span className="cur-time">{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={progress}
            className="progress-bar"
            onChange={handleProgressChange}
            step="0.1"
          />
          <span className="cur-time cur-time-end">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls & Volume bar */}
      <div className="controls">
        <button 
          title="Lyrics"
          onClick={() => setShowLyrics(!showLyrics)}
          className={`player-control-icon ${showLyrics ? 'active' : ''}`}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <i className="fa-solid fa-microphone nav-item"></i>
        </button>
        <button title="Queue"><i className="fa-solid fa-list-ul nav-item hide"></i></button>
        <button title="Connect"><i className="fa-solid fa-laptop-code nav-item hide"></i></button>
        <div className="volume-bar-container">
          {volume === 0 ? (
            <i className="fa-solid fa-volume-xmark" onClick={() => setVolume(0.5)}></i>
          ) : volume < 0.4 ? (
            <i className="fa-solid fa-volume-low" onClick={() => setVolume(0)}></i>
          ) : (
            <i className="fa-solid fa-volume-high" onClick={() => setVolume(0)}></i>
          )}
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume} 
            className="volume-bar"
            onChange={handleVolumeChange}
          />
        </div>
      </div>
      {/* Lyrics Panel */}
      {showLyrics && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '240px',
          width: '320px',
          height: '380px',
          backgroundColor: '#181818',
          border: '1px solid #282828',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.8rem 1rem',
            borderBottom: '1px solid #282828',
            backgroundColor: '#121212'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1ed760', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-microphone"></i> Lyrics: {currentSong.title}
            </span>
            <button 
              onClick={() => setShowLyrics(false)}
              style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1rem',
            lineHeight: '1.8',
            fontSize: '0.8rem',
            textAlign: 'center',
            color: '#e5e5e5'
          }}>
            {getMockLyrics(currentSong.title, currentSong.artist).map((line, idx) => (
              <p 
                key={idx} 
                style={{ 
                  margin: '0.4rem 0', 
                  fontWeight: line.startsWith('[') ? 'bold' : 'normal',
                  color: line.startsWith('[') ? '#1ed760' : '#e5e5e5'
                }}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
