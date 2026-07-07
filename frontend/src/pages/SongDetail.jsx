import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const SongDetail = ({ setActiveTab }) => {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    seekTo,
    isShuffle,
    isRepeat,
    setIsShuffle,
    setIsRepeat
  } = useContext(PlayerContext);

  const { likedSongs, likeSong, unlikeSong, user } = useContext(AuthContext);

  if (!currentSong) {
    return (
      <div className="song-detail-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '1rem' }}>
        <p style={{ opacity: 0.6 }}>No song selected</p>
        <button onClick={() => setActiveTab('home')} className="badge">Go Home</button>
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

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === null) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getMockLyrics = (title, artist) => {
    return [
      "[Verse 1]",
      `Singing along to "${title}"`,
      "Underneath the midnight sky",
      `With ${artist} playing soft and slow`,
      "As the hours keep passing by",
      "",
      "[Chorus]",
      "Oh, this melody is sweet",
      "Moving right down to our feet",
      "Listening to the rhythm beat",
      "Making this moment complete",
      "",
      "[Verse 2]",
      "A Spotify clone made with care",
      "Beautiful music in the air",
      "Sharing notes from here to there",
      "With coding magic everywhere"
    ];
  };

  const lyrics = getMockLyrics(currentSong.title, currentSong.artist);

  return (
    <div className="song-detail-container">
      <div className="song-detail-header">
        <button className="back-btn" onClick={() => setActiveTab('home')}>
          <i className="fa-solid fa-chevron-down"></i> Back to Browse
        </button>
        <span className="now-playing-label">Now Playing</span>
        <div style={{ width: '80px' }}></div> {/* Spacer */}
      </div>

      <div className="song-detail-content">
        <div className="song-detail-left">
          <div className="album-art-wrapper">
            <img src={currentSong.coverUrl} className="album-art-large" alt={currentSong.title} />
            
            {/* Neon Visualizer Equalizer */}
            <div className={`neon-visualizer ${isPlaying ? 'playing' : ''}`}>
              <div className="bar bar1"></div>
              <div className="bar bar2"></div>
              <div className="bar bar3"></div>
              <div className="bar bar4"></div>
              <div className="bar bar5"></div>
              <div className="bar bar6"></div>
              <div className="bar bar7"></div>
              <div className="bar bar8"></div>
            </div>
          </div>
        </div>

        <div className="song-detail-right">
          <div className="song-info-row">
            <div className="song-info-text">
              <h2>{currentSong.title}</h2>
              <p>{currentSong.artist}</p>
            </div>
            <button className="like-btn" onClick={handleLikeToggle}>
              {isLiked ? (
                <i className="fa-solid fa-heart" style={{ color: '#1ed760' }}></i>
              ) : (
                <i className="fa-regular fa-heart"></i>
              )}
            </button>
          </div>

          {/* Progress Slider */}
          <div className="playback-bar-large">
            <span className="time">{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress || 0}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="slider-large"
            />
            <span className="time">{formatTime(duration)}</span>
          </div>

          {/* Player Controls */}
          <div className="player-controls-large">
            <button 
              className={`control-icon-large ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(prev => !prev)}
            >
              <i className="fa-solid fa-shuffle"></i>
            </button>
            <button className="control-icon-large" onClick={previousTrack}>
              <i className="fa-solid fa-backward-step"></i>
            </button>
            <button className="play-btn-large" onClick={togglePlay}>
              {isPlaying ? (
                <i className="fa-solid fa-pause"></i>
              ) : (
                <i className="fa-solid fa-play" style={{ marginLeft: '4px' }}></i>
              )}
            </button>
            <button className="control-icon-large" onClick={nextTrack}>
              <i className="fa-solid fa-forward-step"></i>
            </button>
            <button 
              className={`control-icon-large ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(prev => !prev)}
            >
              <i className="fa-solid fa-repeat"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Down Section */}
      <div className="song-detail-lyrics">
        <h3>Lyrics</h3>
        <div className="lyrics-lines-wrapper">
          {lyrics.map((line, idx) => (
            <p 
              key={idx} 
              className={`lyrics-line ${line.startsWith('[') ? 'lyrics-section-header' : ''}`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SongDetail;
