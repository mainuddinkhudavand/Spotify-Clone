import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sticky-nav">
      <div className="sticky-nav-icons">
        <img 
          src="/assets/backward_icon.png" 
          alt="Back" 
          onClick={() => setActiveTab('home')} 
        />
        <img 
          src="/assets/forward_icon.png" 
          alt="Forward" 
          className="hide" 
        />
      </div>
      
      <div className="sticky-nav-options">
        <button className="badge nav-item hide">Explore Premium</button>
        <button className="badge nav-item dark-badge">
          <i className="fa-regular fa-circle-down" style={{ marginRight: '5px' }}></i>Install App
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user.username}</span>
            <button 
              className="user-profile-btn" 
              title="Log Out"
              onClick={logout}
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="badge nav-item dark-badge" 
              onClick={() => setActiveTab('register')}
            >
              Sign Up
            </button>
            <button 
              className="badge nav-item" 
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
