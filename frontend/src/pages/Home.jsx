import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

const Home = () => {
  const { playSong } = useContext(PlayerContext);
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
