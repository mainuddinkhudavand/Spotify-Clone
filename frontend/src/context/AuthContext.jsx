import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [likedSongs, setLikedSongs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to Spotify!', time: new Date() }
  ]);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            
            // Load user favorites
            const favRes = await fetch(`${API_URL}/user/favorites`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (favRes.ok) {
              const favData = await favRes.json();
              setLikedSongs(favData.map(song => song._id));
            }

            // Load user history
            const histRes = await fetch(`${API_URL}/user/history`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (histRes.ok) {
              const histData = await histRes.json();
              setHistory(histData);
            }
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (emailOrUsername, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailOrUsername, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        addNotification(`Logged in as @${data.user?.username || 'user'}`);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Server connection error' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        addNotification('Registered and logged in successfully!');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Server connection error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setLikedSongs([]);
    setHistory([]);
    addNotification('Logged out successfully');
  };

  const likeSong = async (songId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/like/${songId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLikedSongs(prev => [...prev, songId]);
        addNotification('Added song to Liked Songs');
      }
    } catch (error) {
      console.error('Error liking song:', error);
    }
  };

  const unlikeSong = async (songId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/unlike/${songId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setLikedSongs(prev => prev.filter(id => id !== songId));
        addNotification('Removed song from Liked Songs');
      }
    } catch (error) {
      console.error('Error unliking song:', error);
    }
  };

  const addSongToHistory = async (songId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ songId })
      });
      if (res.ok) {
        // Refresh local history list
        const histRes = await fetch(`${API_URL}/user/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
        }
      }
    } catch (error) {
      console.error('Error logging listening history:', error);
    }
  };

  const clearHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/user/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setHistory([]);
        addNotification('Cleared listening history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const updateProfile = async (username, email, profilePic) => {
    if (!token) return { success: false, message: 'Not logged in' };
    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, email, profilePic })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ 
          ...prev, 
          username: data.username, 
          email: data.email, 
          profilePic: data.profilePic 
        }));
        addNotification('Profile details updated successfully');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Server connection error' };
    }
  };

  const addNotification = (text) => {
    setNotifications(prev => [
      { id: Date.now(), text, time: new Date() },
      ...prev.slice(0, 19)
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      likedSongs,
      history,
      loading,
      login,
      register,
      logout,
      likeSong,
      unlikeSong,
      addSongToHistory,
      clearHistory,
      updateProfile,
      notifications,
      addNotification,
      clearNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};
