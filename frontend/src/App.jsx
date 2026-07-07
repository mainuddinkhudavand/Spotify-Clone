import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Playlists from './pages/Playlists';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const MainApp = () => {
  const { token, addNotification } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [playlistRefresh, setPlaylistRefresh] = useState(0);

  const API_URL = 'http://localhost:5000/api';

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: playlistTitle,
          description: playlistDesc,
          isPublic: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh sidebar
        setPlaylistRefresh(prev => prev + 1);
        setShowCreateModal(false);
        setPlaylistTitle('');
        setPlaylistDesc('');
        addNotification(`Playlist "${data.title}" created successfully`);
        // Route to the new playlist
        setActiveTab(`playlist-${data._id}`);
      } else {
        alert("Failed to create playlist");
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return <Home />;
    } else if (activeTab === 'search') {
      return <Search />;
    } else if (activeTab === 'favorites') {
      return <Favorites />;
    } else if (activeTab === 'history') {
      return <History />;
    } else if (activeTab === 'login') {
      return <Login setActiveTab={setActiveTab} />;
    } else if (activeTab === 'register') {
      return <Register setActiveTab={setActiveTab} />;
    } else if (activeTab === 'profile') {
      return <Profile setActiveTab={setActiveTab} />;
    } else if (activeTab.startsWith('playlist-')) {
      const playlistId = activeTab.replace('playlist-', '');
      return (
        <Playlists 
          playlistId={playlistId} 
          setActiveTab={setActiveTab} 
          onPlaylistsUpdated={() => setPlaylistRefresh(prev => prev + 1)}
        />
      );
    }
    return <Home />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <div className="main">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onCreatePlaylistClick={() => setShowCreateModal(true)}
          playlistsRefreshTrigger={playlistRefresh}
        />
        <div className="main-content">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
        </div>
      </div>
      
      <MusicPlayer />

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Create new playlist</h3>
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  placeholder="My Playlist"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  placeholder="Add an optional description"
                />
              </div>
              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn modal-btn-submit">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <button 
          onClick={() => setActiveTab('home')} 
          className={activeTab === 'home' ? 'active' : ''}
        >
          <i className="fa-solid fa-house"></i>
          <span>Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('search')} 
          className={activeTab === 'search' ? 'active' : ''}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <span>Search</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')} 
          className={activeTab === 'favorites' ? 'active' : ''}
        >
          <i className="fa-solid fa-heart"></i>
          <span>Liked</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={activeTab === 'profile' ? 'active' : ''}
        >
          <i className="fa-regular fa-user"></i>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PlayerProvider>
        <MainApp />
      </PlayerProvider>
    </AuthProvider>
  );
};

export default App;
