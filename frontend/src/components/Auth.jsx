import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Auth() {
  const { loginUser, registerUser, loading } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      loginUser(email, password);
    } else {
      registerUser(username, email, password);
    }
  };

  return (
    <div className="auth-container glass animate-scale-in">
      <div className="auth-header">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          {isLogin ? 'Sign in to access your wishlist & cart' : 'Join us to merge bundles and shop'}
        </p>
      </div>

      <div className="auth-tabs">
        <div 
          className={`auth-tab ${isLogin ? 'active' : ''}`} 
          onClick={() => setIsLogin(true)}
        >
          Sign In
        </div>
        <div 
          className={`auth-tab ${!isLogin ? 'active' : ''}`} 
          onClick={() => setIsLogin(false)}
        >
          Register
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group animate-fade-in">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-input" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '12px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
