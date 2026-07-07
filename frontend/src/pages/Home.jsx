import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const Home = ({ setActiveTab }) => {
  const { playSong } = useContext(PlayerContext);
  const { token, user, addNotification } = useContext(AuthContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch(`${API_URL}/songs`);
        if (res.ok) {
          const data = await res.json();
          setSongs(data);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const filterSongs = (category) => {
    return songs.filter(song => song.category === category);
  };

  const handlePlayClick = (song, categorySongs) => {
    playSong(song, categorySongs);
  };

  const generateMoodPlaylist = async (mood, category) => {
    if (!user) {
      alert("Log in to generate and play your custom Mood Mix!");
      return;
    }
    const matchingSongs = filterSongs(category);
    if (matchingSongs.length === 0) {
      alert("No songs found for this mood!");
      return;
    }
    const songIds = matchingSongs.map(song => song._id);

    try {
      const res = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${mood} Mix`,
          description: `A custom generated playlist for a ${mood} vibe, compiled from your library.`,
          songs: songIds,
          isPublic: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        addNotification(`Generated ${mood} Mix successfully!`);
        // Start playing the playlist
        if (data.songs && data.songs.length > 0) {
          playSong(data.songs[0], data.songs);
        }
        if (setActiveTab) {
          setActiveTab(`playlist-${data._id}`);
        }
      } else {
        alert("Failed to generate mood playlist");
      }
    } catch (error) {
      console.error("Error generating mood playlist:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ opacity: 0.6 }}>Loading music library...</p>
      </div>
    );
  }

  const recentlyPlayed = filterSongs('recently-played');
  const trending = filterSongs('trending');
  const featured = filterSongs('featured');

  return (
    <div>
      <h2>Generate Mood Mix</h2>
      <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>Select a mood to instantly generate and play a custom playlist matching your vibe!</p>
      <div className="mood-grid">
        <div className="mood-card happy" onClick={() => generateMoodPlaylist('Happy', 'trending')}>
          <i className="fa-regular fa-face-smile"></i>
          <span>Happy Mix</span>
        </div>
        <div className="mood-card chill" onClick={() => generateMoodPlaylist('Chill', 'recently-played')}>
          <i className="fa-solid fa-mug-hot"></i>
          <span>Chill Mix</span>
        </div>
        <div className="mood-card focus" onClick={() => generateMoodPlaylist('Focus', 'popular')}>
          <i className="fa-solid fa-brain"></i>
          <span>Focus Mix</span>
        </div>
        <div className="mood-card energetic" onClick={() => generateMoodPlaylist('Energetic', 'featured')}>
          <i className="fa-solid fa-bolt"></i>
          <span>Energetic Mix</span>
        </div>
      </div>
      {recentlyPlayed.length > 0 && (
        <>
          <h2>Recently Played</h2>
          <div className="cards-container">
            {recentlyPlayed.map(song => (
              <div 
                key={song._id} 
                className="card"
                onDoubleClick={() => handlePlayClick(song, recentlyPlayed)}
              >
                <div className="card-img-wrapper">
                  <img src={song.coverUrl} className="card-img" alt={song.title} />
                  <button 
                    className="card-play-btn"
                    onClick={() => handlePlayClick(song, recentlyPlayed)}
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                </div>
                <p className="card-title">{song.title}</p>
                <p className="card-info">{song.artist} • {song.album}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {trending.length > 0 && (
        <>
          <h2>Trending Now Near You</h2>
          <div className="cards-container">
            {trending.map(song => (
              <div 
                key={song._id} 
                className="card"
                onDoubleClick={() => handlePlayClick(song, trending)}
              >
                <div className="card-img-wrapper">
                  <img src={song.coverUrl} className="card-img" alt={song.title} />
                  <button 
                    className="card-play-btn"
                    onClick={() => handlePlayClick(song, trending)}
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                </div>
                <p className="card-title">{song.title}</p>
                <p className="card-info">{song.artist} • {song.album}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {featured.length > 0 && (
        <>
          <h2>Featured Charts</h2>
          <div className="cards-container">
            {featured.map(song => (
              <div 
                key={song._id} 
                className="card"
                onDoubleClick={() => handlePlayClick(song, featured)}
              >
                <div className="card-img-wrapper">
                  <img src={song.coverUrl} className="card-img" alt={song.title} />
                  <button 
                    className="card-play-btn"
                    onClick={() => handlePlayClick(song, featured)}
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                </div>
                <p className="card-title">{song.title}</p>
                <p className="card-info">{song.artist} • {song.album}</p>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="footer">
        <div className="line"></div>
      </div>
    </div>
  );
};

export default Home;
