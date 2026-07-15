import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import WishlistCard from './components/WishlistCard';
import CartItem from './components/CartItem';
import CombineModal from './components/CombineModal';
import CheckoutModal from './components/CheckoutModal';
import Auth from './components/Auth';
import Toast from './components/Toast';
import { Sparkles, ShoppingCart, Heart, Package, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  const { activeTab, setActiveTab, products, wishlist, cart, user, token } = useApp();
  const [selectedWishIds, setSelectedWishIds] = useState([]);
  const [isCombineOpen, setIsCombineOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Toggle wishlist item selection
  const handleSelectToggle = (itemId) => {
    setSelectedWishIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Find the actual selected wishlist items to pass to CombineModal
  const selectedWishlistItems = wishlist.items.filter((item) =>
    selectedWishIds.includes(item._id)
  );

  // Render Home Tab
  const renderHome = () => (
    <div className="animate-fade-in">
      <div 
        style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 32px',
          textAlign: 'center',
          marginBottom: '40px',
          border: '1px solid var(--glass-border)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
            Shop in Bundles, <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Save Big</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 24px' }}>
            Add items to your wishlist, combine them to design custom setups, unlock reward discounts, and buy them all at once!
          </p>
          <button onClick={() => setActiveTab('wishlist')} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Go to My Wishlist
          </button>
        </div>
        <div 
          style={{ 
            position: 'absolute', 
            top: '-20%', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: '400px', 
            height: '400px', 
            background: 'var(--color-primary-glow)', 
            filter: 'blur(100px)', 
            borderRadius: '50%',
            opacity: 0.5,
            zIndex: 0 
          }} 
        />
      </div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={22} style={{ color: 'var(--color-primary)' }} />
        <span>Featured Products</span>
      </h2>

      {products.length === 0 ? (
        <div className="empty-state">
          <HelpCircle className="empty-state-icon" />
          <h3>No Products Found</h3>
          <p>Please check if the backend server is running and database seeded.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );

  // Render Wishlist Tab
  const renderWishlist = () => {
    if (!token) {
      return (
        <div className="empty-state animate-scale-in">
          <Heart className="empty-state-icon" style={{ color: 'var(--color-primary)' }} />
          <h3>Sign In to View Wishlist</h3>
          <p>Create an account or login to manage wishlists and combine bundles.</p>
          <button onClick={() => setActiveTab('auth')} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Sign In Now
          </button>
        </div>
      );
    }

    const items = wishlist?.items || [];

    return (
      <div className="animate-fade-in">
        <div className="wishlist-header-bar glass">
          <div>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Heart size={24} fill="#f43f5e" stroke="none" />
              <span>My Wishlist ({items.length})</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Select items using checkboxes, then click "Combine Selected" to bundle them.
            </p>
          </div>

          <div>
            {selectedWishIds.length >= 2 ? (
              <button 
                onClick={() => setIsCombineOpen(true)} 
                className="btn btn-accent animate-pulse-border"
                style={{ display: 'inline-flex', gap: '8px', boxShadow: '0 0 15px var(--color-accent-glow)' }}
              >
                <Sparkles size={16} />
                <span>Combine Selected ({selectedWishIds.length})</span>
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-disabled"
                title="Select at least 2 items to combine"
                disabled
              >
                Select {2 - selectedWishIds.length} more to Combine
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <Heart className="empty-state-icon" />
            <h3>Your Wishlist is Empty</h3>
            <p>Go to the Home catalog, explore products, and save them to your wishlist.</p>
            <button onClick={() => setActiveTab('home')} className="btn btn-secondary" style={{ marginTop: '20px' }}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <WishlistCard 
                key={item._id} 
                item={item} 
                isSelected={selectedWishIds.includes(item._id)}
                onSelectToggle={handleSelectToggle}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Cart Tab
  const renderCart = () => {
    if (!token) {
      return (
        <div className="empty-state animate-scale-in">
          <ShoppingCart className="empty-state-icon" style={{ color: 'var(--color-primary)' }} />
          <h3>Sign In to View Cart</h3>
          <p>Please log in to manage your shopping cart and place orders.</p>
          <button onClick={() => setActiveTab('auth')} className="btn btn-primary" style={{ marginTop: '20px' }}>
            Sign In Now
          </button>
        </div>
      );
    }

    const items = cart?.items || [];
    
    // Sum prices
    const originalSubtotal = items.reduce((sum, item) => {
      if (item.type === 'single' && item.product) {
        return sum + item.product.price * item.qty;
      } else if (item.type === 'combined' && item.products) {
        const bundleSum = item.products.reduce((acc, p) => acc + (p?.price || 0), 0);
        return sum + bundleSum * item.qty;
      }
      return sum;
    }, 0);

    const discountSavings = items.reduce((sum, item) => {
      if (item.type === 'combined' && item.products) {
        const bundleSum = item.products.reduce((acc, p) => acc + (p?.price || 0), 0);
        const savings = bundleSum * ((item.discount || 0) / 100);
        return sum + savings * item.qty;
      }
      return sum;
    }, 0);

    const total = originalSubtotal - discountSavings;

    return (
      <div className="animate-fade-in">
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={22} style={{ color: 'var(--color-primary)' }} />
          <span>Shopping Cart</span>
        </h2>

        {items.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart className="empty-state-icon" />
            <h3>Your Cart is Empty</h3>
            <p>You haven't added any products or custom bundles to your cart yet.</p>
            <button onClick={() => setActiveTab('home')} className="btn btn-secondary" style={{ marginTop: '20px' }}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            <div className="cart-summary-card glass">
              <h3 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                Summary
              </h3>
              
              <div className="summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>${originalSubtotal.toFixed(2)}</span>
              </div>

              {discountSavings > 0 && (
                <div className="summary-row" style={{ color: '#10b981' }}>
                  <span>Bundle Discounts:</span>
                  <span>-${discountSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>FREE</span>
              </div>

              <div className="summary-row" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '16px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--color-secondary)' }}>${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => setIsCheckoutOpen(true)} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '24px', padding: '12px' }}
              >
                Proceed to Checkout
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>Secure SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="container" style={{ flexGrow: 1, padding: '40px 24px 80px' }}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'wishlist' && renderWishlist()}
        {activeTab === 'cart' && renderCart()}
        {activeTab === 'auth' && <Auth />}
      </main>

      <footer 
        style={{ 
          borderTop: '1px solid var(--glass-border)', 
          padding: '24px 0', 
          textAlign: 'center', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          background: 'var(--bg-secondary)'
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} VibeShop. Powered by React, Express & MongoDB. Experimental wishlist combination system.</p>
        </div>
      </footer>

      {/* Global Toast Alerts */}
      <Toast />

      {/* Conditional Modals */}
      {isCombineOpen && (
        <CombineModal 
          selectedItems={selectedWishlistItems} 
          onClose={() => {
            setIsCombineOpen(false);
            setSelectedWishIds([]); // Clear selection after closing
          }}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal 
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
