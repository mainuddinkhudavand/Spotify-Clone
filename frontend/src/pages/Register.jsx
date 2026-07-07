import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Register = ({ setActiveTab }) => {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(username, email, password);
      if (res.success) {
        setActiveTab('home');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="assets/logo.png" className="auth-logo" alt="Spotify" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="auth-title">Sign up to start listening</h1>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">What should we call you?</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter a profile name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">What is your email address?</label>
            <input 
              type="email" 
              id="email" 
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Create a password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => setActiveTab('login')}>
            Log in here
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
