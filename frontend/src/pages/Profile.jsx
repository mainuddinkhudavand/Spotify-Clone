import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = ({ setActiveTab }) => {
  const { user, token, likedSongs, history, updateProfile } = useContext(AuthContext);

  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setEditUsername(user.username);
      setEditEmail(user.email);
      setProfilePic(user.profilePic || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/playlists`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter to playlists created by the current user
          const myPlaylists = data.filter(pl => pl.creator?._id === user?._id || pl.creator === user?._id);
          setPlaylistsCount(myPlaylists.length);
        }
      } catch (error) {
        console.error('Error fetching stats in profile:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!editUsername.trim() || !editEmail.trim()) {
      setErrorMsg('Username and email are required');
      return;
    }

    const res = await updateProfile(editUsername, editEmail, profilePic);
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
        <i className="fa-solid fa-user-slash" style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.5 }}></i>
        <h2 style={{ margin: 0 }}>User Profile</h2>
        <p style={{ opacity: 0.6, marginTop: '0.5rem', textAlign: 'center' }}>Log in to see your profile details and track your stats.</p>
        <button className="badge" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('login')}>Log In</button>
      </div>
    );
  }

  // Get first letter of username for avatar placeholder
  const avatarLetter = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div>
      <div className="details-header" style={{
        background: 'linear-gradient(to bottom, #1ed760, rgba(18,18,18,0.9))',
        margin: '-1rem -1.5rem 1rem -1.5rem',
        padding: '2.5rem 1.5rem 1.5rem 1.5rem'
      }}>
        <div 
          onClick={() => document.getElementById('profile-pic-input').click()}
          style={{
            width: '192px',
            height: '192px',
            borderRadius: '50%',
            background: profilePic ? `url(${profilePic}) center/cover no-repeat` : 'linear-gradient(135deg, #1ed760, #0c5c29)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            fontSize: '4.5rem',
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="profile-avatar-container"
        >
          {!profilePic && avatarLetter}
          <div className="upload-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            fontSize: '0.9rem',
            color: '#fff',
            fontWeight: 'normal'
          }}>
            <i className="fa-solid fa-camera" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}></i>
            <span>Upload Photo</span>
          </div>
        </div>
        <input 
          type="file" 
          id="profile-pic-input" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
        <div className="details-metadata">
          <span className="details-type">Profile</span>
          <span className="details-title">{user.username}</span>
          <span className="details-description">Account Email: {user.email}</span>
          <span className="details-stats">
            Spotify Member <span className="bullet">•</span> {playlistsCount} Playlists <span className="bullet">•</span> {likedSongs.length} Liked Songs
          </span>
        </div>
      </div>

      <div style={{ padding: '1rem 0' }}>
        <h2>Your Dashboard</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          
          {/* Liked Songs Stats Card */}
          <div 
            className="card" 
            onClick={() => setActiveTab('favorites')}
            style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', padding: '1.25rem', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#b3b3b3', fontWeight: 'bold' }}>LIKED SONGS</span>
              <i className="fa-solid fa-heart" style={{ color: '#1ed760', fontSize: '1.2rem' }}></i>
            </div>
            <span style={{ fontSize: '2.25rem', fontWeight: '800' }}>{likedSongs.length}</span>
            <span style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>Click to view your collection</span>
          </div>

          {/* Created Playlists Stats Card */}
          <div 
            className="card" 
            onClick={() => setActiveTab('home')}
            style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', padding: '1.25rem', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#b3b3b3', fontWeight: 'bold' }}>PLAYLISTS</span>
              <i className="fa-solid fa-music" style={{ color: '#1ed760', fontSize: '1.2rem' }}></i>
            </div>
            <span style={{ fontSize: '2.25rem', fontWeight: '800' }}>{loadingStats ? '...' : playlistsCount}</span>
            <span style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>Click to view playlists in library</span>
          </div>

          {/* Recently Played Stats Card */}
          <div 
            className="card" 
            onClick={() => setActiveTab('history')}
            style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer', padding: '1.25rem', borderRadius: '8px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#b3b3b3', fontWeight: 'bold' }}>RECENT STREAMS</span>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: '#1ed760', fontSize: '1.2rem' }}></i>
            </div>
            <span style={{ fontSize: '2.25rem', fontWeight: '800' }}>{history.length}</span>
            <span style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>Click to view listening history</span>
          </div>

        </div>

        <h2>Edit Profile Settings</h2>
        <div style={{ maxWidth: '500px', backgroundColor: '#181818', padding: '2rem', borderRadius: '8px', border: '1px solid #282828' }}>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#ff4d4d20', color: '#ff4d4d', border: '1px solid #ff4d4d40', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '5px' }}></i> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: '#1ed76020', color: '#1ed760', border: '1px solid #1ed76040', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i> {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', color: '#b3b3b3', marginBottom: '0.5rem', display: 'block' }}>Username</label>
              <input 
                type="text" 
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="My Username"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #727272', backgroundColor: '#121212', color: '#fff', outline: 'none' }}
              />
            </div>
            
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', color: '#b3b3b3', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
              <input 
                type="email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #727272', backgroundColor: '#121212', color: '#fff', outline: 'none' }}
              />
            </div>

            {profilePic && (
              <div className="form-group" style={{ margin: '0.5rem 0 0 0' }}>
                <button 
                  type="button" 
                  className="badge" 
                  onClick={() => setProfilePic('')}
                  style={{ backgroundColor: '#ff4d4d', color: '#fff', fontWeight: 'bold', width: 'auto', padding: '0.4rem 1.25rem', fontSize: '0.75rem', border: 'none', cursor: 'pointer', margin: 0 }}
                >
                  Remove Profile Photo
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="badge" 
              style={{ alignSelf: 'flex-start', margin: '0.5rem 0 0 0', backgroundColor: '#1ed760', color: '#000', fontWeight: 'bold', width: 'auto', padding: '0.75rem 2rem', fontSize: '0.85rem' }}
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
