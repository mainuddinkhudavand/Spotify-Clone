import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';

const Sidebar = ({ activeTab, setActiveTab, onCreatePlaylistClick, playlistsRefreshTrigger }) => {
  const { user, token } = useContext(AuthContext);
  const { playSong } = useContext(PlayerContext);
  const [playlists, setPlaylists] = useState([]);
  const [showPodcastsModal, setShowPodcastsModal] = useState(false);

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
          <div 
            className="lib-option"
            onClick={() => setActiveTab('favorites')}
            style={{ cursor: 'pointer' }}
          >
            <img src="assets/library_icon.png" alt="Library" />
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('favorites'); }}>Your Library</a>
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
              alignItems: 'center',
              justifyContent: 'center'
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
              alignItems: 'center',
              justifyContent: 'center'
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
                  <img src={pl.coverUrl || 'assets/card3img.jpeg'} alt={pl.title} />
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
            <button className="badge" onClick={() => setShowPodcastsModal(true)}>Browse podcasts</button>
          </div>
        </div>
      </div>
      {/* Podcasts Modal */}
      {showPodcastsModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-podcast" style={{ color: '#1ed760' }}></i> Follow Podcasts
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.25rem' }}>Follow your favorite shows to get updates on new episodes.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { name: "The Daily Tech Talk", creator: "Tech Network", desc: "Your daily dose of tech news and gossip.", listeners: "120K followers" },
                { name: "Lex Fridman Podcast", creator: "Lex Fridman", desc: "Conversations about science, tech, history, and love.", listeners: "2.4M followers" },
                { name: "Coding Blocks", creator: "Coding Blocks Team", desc: "Software design, architecture, and engineering discussions.", listeners: "85K followers" },
                { name: "Syntax - Tasty Web Development", creator: "Wes Bos & Scott Tolinski", desc: "A podcast for web developers.", listeners: "310K followers" }
              ].map((pod, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818', padding: '0.75rem 1rem', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '70%' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{pod.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#1ed760' }}>{pod.creator} • {pod.listeners}</span>
                    <span style={{ fontSize: '0.7rem', color: '#b3b3b3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pod.desc}</span>
                  </div>
                  <button 
                    className="badge" 
                    style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.7rem', backgroundColor: '#1ed760', color: '#000', fontWeight: 'bold' }}
                    onClick={() => { alert(`You are now following "${pod.name}"!`); setShowPodcastsModal(false); }}
                  >
                    Follow
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-buttons" style={{ justifyContent: 'center' }}>
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setShowPodcastsModal(false)}
                style={{ borderRadius: '100px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
