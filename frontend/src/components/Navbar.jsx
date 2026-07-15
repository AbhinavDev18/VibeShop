import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Heart, ShoppingCart, User, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, user, wishlist, cart, logout } = useApp();
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Calculate cart items total quantity
  const cartCount = cart?.items?.reduce((acc, item) => acc + item.qty, 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;

  return (
    <nav className="navbar glass">
      <div className="container navbar-container">
        <div className="logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">V</div>
          <span>VibeShop</span>
        </div>

        <div className="nav-links">
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={18} />
            <span>Wishlist</span>
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </div>

          <div 
            className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
          </button>

          {/* User Profile / Auth State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                <User size={18} className="logo-icon" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                <span>{user.username}</span>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', display: 'inline-flex', gap: '6px' }}
              >
                <LogOut size={16} />
                <span style={{ fontSize: '0.85rem' }}>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('auth')} 
              className={`btn btn-primary ${activeTab === 'auth' ? 'btn-disabled' : ''}`}
              disabled={activeTab === 'auth'}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
