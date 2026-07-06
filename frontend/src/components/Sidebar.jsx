import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';

const Sidebar = ({ activeTab, setActiveTab, onCreatePlaylistClick, playlistsRefreshTrigger }) => {
  const { user, token } = useContext(AuthContext);
  const { playSong } = useContext(PlayerContext);
  const [playlists, setPlaylists] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!token) {
        setPlaylists([]);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/playlists`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPlaylists(data);
        }
      } catch (error) {
        console.error('Error fetching playlists in sidebar:', error);
      }
    };

    fetchPlaylists();
  }, [token, playlistsRefreshTrigger]);

  const handlePlaylistClick = (playlistId) => {
    setActiveTab(`playlist-${playlistId}`);
  };

  return (
    <div className="sidebar">
      <div className="nav">
        <div 
          className={`nav-option ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <i className="fa-solid fa-house"></i>
          <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
        </div>
        <div 
          className={`nav-option ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <a href="#" onClick={(e) => e.preventDefault()}>Search</a>
        </div>
      </div>
      
      <div className="library">
        <div className="options">
          <div className="lib-option">
            <img src="/assets/library_icon.png" alt="Library" />
            <a href="#" onClick={(e) => e.preventDefault()}>Your Library</a>
          </div>
          <div className="icons">
            {user && (
              <i 
                className="fa-solid fa-plus" 
                title="Create Playlist"
                onClick={onCreatePlaylistClick}
              ></i>
            )}
            <i className="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        <div className="lib-box">
          {/* Default Navigation Links */}
          <div 
            className={`sidebar-playlist-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
            style={{ padding: '0.75rem 0.5rem' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #450af5, #c4efd9)',
              display: 'flex',
              align-items: 'center',
              justify-content: 'center'
            }}>
              <i className="fa-solid fa-heart" style={{ color: '#fff', fontSize: '1rem' }}></i>
            </div>
            <div className="sidebar-playlist-info" style={{ marginLeft: '0.5rem' }}>
              <span className="sidebar-playlist-title">Liked Songs</span>
              <span className="sidebar-playlist-type">Playlist</span>
            </div>
          </div>

          <div 
            className={`sidebar-playlist-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            style={{ padding: '0.75rem 0.5rem' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #333, #111)',
              display: 'flex',
              align-items: 'center',
              justify-content: 'center'
            }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#b3b3b3', fontSize: '1rem' }}></i>
            </div>
            <div className="sidebar-playlist-info" style={{ marginLeft: '0.5rem' }}>
              <span className="sidebar-playlist-title">Listening History</span>
              <span className="sidebar-playlist-type">Recent</span>
            </div>
          </div>

          {/* User Playlists */}
          {user ? (
            playlists.length > 0 ? (
              playlists.map(pl => (
                <div 
                  key={pl._id}
                  className={`sidebar-playlist-item ${activeTab === `playlist-${pl._id}` ? 'active' : ''}`}
                  onClick={() => handlePlaylistClick(pl._id)}
                >
                  <img src={pl.coverUrl || '/assets/card3img.jpeg'} alt={pl.title} />
                  <div className="sidebar-playlist-info">
                    <span className="sidebar-playlist-title">{pl.title}</span>
                    <span className="sidebar-playlist-type">Playlist • {pl.creator?.username || 'You'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="box">
                <p className="box-p1">Create your first playlist</p>
                <p className="box-p2">It's easy, we'll help you</p>
                <button className="badge" onClick={onCreatePlaylistClick}>Create Playlist</button>
              </div>
            )
          ) : (
            <div className="box">
              <p className="box-p1">Enjoy custom playlists</p>
              <p className="box-p2">Log in to create and manage custom music mixes</p>
              <button className="badge" onClick={() => setActiveTab('login')}>Log In</button>
            </div>
          )}

          <div className="box">
            <p className="box-p1">Let's find some podcasts to follow</p>
            <p className="box-p2">We'll keep you updated on new episodes</p>
            <button className="badge">Browse podcasts</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
