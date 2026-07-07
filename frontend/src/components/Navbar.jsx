import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  return (
    <div className="sticky-nav">
      <div className="sticky-nav-icons">
        <img 
          src="assets/backward_icon.png" 
          alt="Back" 
          onClick={() => setActiveTab('home')} 
          style={{ cursor: 'pointer' }}
        />
        <img 
          src="assets/forward_icon.png" 
          alt="Forward" 
          className="hide" 
        />
      </div>
      
      <div className="sticky-nav-options">
        <button 
          className="badge nav-item" 
          onClick={() => setShowPremiumModal(true)}
          style={{ cursor: 'pointer' }}
        >
          Explore Premium
        </button>
        <button 
          className="badge nav-item dark-badge" 
          onClick={() => setShowInstallModal(true)}
          style={{ cursor: 'pointer' }}
        >
          <i className="fa-regular fa-circle-down" style={{ marginRight: '5px' }}></i>Install App
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '0.4rem 0.8rem',
                borderRadius: '100px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            >
              {user.profilePic ? (
                <img 
                  src={user.profilePic} 
                  style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} 
                  alt="" 
                />
              ) : (
                <i className="fa-regular fa-user"></i>
              )}
              <span>{user.username}</span>
            </button>
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

      {/* Explore Premium Modal */}
      {showPremiumModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ background: 'linear-gradient(135deg, #121212, #1ed76020)', border: '1px solid #1ed76040', maxWidth: '450px' }}>
            <h3 className="modal-title" style={{ color: '#1ed760', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-gem"></i> Spotify Premium
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.25rem' }}>Experience the ultimate sound quality with zero interruptions.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#1ed760' }}></i>
                <span>Ad-free music listening</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#1ed760' }}></i>
                <span>Download songs for offline listening</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#1ed760' }}></i>
                <span>High-quality audio streams (320kbps)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#1ed760' }}></i>
                <span>Group session listening in real-time</span>
              </div>
            </div>
            <div className="modal-buttons" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setShowPremiumModal(false)}
                style={{ borderRadius: '100px' }}
              >
                Close
              </button>
              <button 
                className="modal-btn modal-btn-submit" 
                onClick={() => { alert("Premium subscription activated! You now have access to premium features."); setShowPremiumModal(false); }}
                style={{ backgroundColor: '#1ed760', color: '#000', borderRadius: '100px', fontWeight: 'bold' }}
              >
                Try 1 Month Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install App Modal */}
      {showInstallModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-circle-down"></i> Get Spotify App
            </h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>Download our app for the best experience on mobile and desktop.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-brands fa-windows" style={{ fontSize: '1.2rem' }}></i> Windows Desktop
                </span>
                <button 
                  className="badge" 
                  style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => { alert("Downloading installer for Windows..."); setShowInstallModal(false); }}
                >
                  Download
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-brands fa-apple" style={{ fontSize: '1.2rem' }}></i> macOS App
                </span>
                <button 
                  className="badge" 
                  style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => { alert("Downloading app for macOS..."); setShowInstallModal(false); }}
                >
                  Download
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#181818', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-brands fa-android" style={{ fontSize: '1.2rem' }}></i> Mobile App
                </span>
                <button 
                  className="badge" 
                  style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => { alert("Redirecting to the App Store..."); setShowInstallModal(false); }}
                >
                  Get Link
                </button>
              </div>
            </div>
            <div className="modal-buttons" style={{ justifyContent: 'center' }}>
              <button 
                className="modal-btn modal-btn-cancel" 
                onClick={() => setShowInstallModal(false)}
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

export default Navbar;
