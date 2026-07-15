import React from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, Layers } from 'lucide-react';

export default function CartItem({ item }) {
  const { updateCartQty, removeFromCart } = useApp();

  const handleQtyChange = (newQty) => {
    if (newQty < 1) return;
    updateCartQty(item._id, newQty);
  };

  if (item.type === 'single') {
    const product = item.product;
    if (!product) return null;

    return (
      <div className="cart-item-card glass animate-fade-in">
        <div className="wishlist-img" style={{ width: '80px', height: '80px' }}>
          <img 
            src={product.image} 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/80x80/1a1b26/ffffff?text=' + encodeURIComponent(product.name);
            }}
          />
        </div>

        <div className="wishlist-info">
          <h4 style={{ fontSize: '1.05rem' }}>{product.name}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{product.category}</p>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-secondary)', marginTop: '4px', display: 'block' }}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        <div className="cart-item-qty">
          <button 
            onClick={() => handleQtyChange(item.qty - 1)} 
            className="qty-btn"
            disabled={item.qty <= 1}
          >
            <Minus size={14} />
          </button>
          <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
          <button 
            onClick={() => handleQtyChange(item.qty + 1)} 
            className="qty-btn"
          >
            <Plus size={14} />
          </button>
        </div>

        <button 
          onClick={() => removeFromCart(item._id)} 
          className="btn btn-secondary"
          style={{ padding: '8px', color: '#ef4444', borderColor: 'var(--glass-border)', display: 'flex', alignItems: 'center' }}
          title="Remove from Cart"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  // Combined bundle cart item
  const products = item.products || [];
  const originalPrice = products.reduce((sum, p) => sum + (p?.price || 0), 0);
  const discountedPrice = originalPrice * (1 - (item.discount || 0) / 100);

  return (
    <div className="cart-item-card glass animate-fade-in" style={{ borderLeft: '3px solid var(--color-accent)' }}>
      <div 
        className="wishlist-img" 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'var(--bg-tertiary)', 
          border: '1px solid var(--color-accent-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-accent)'
        }}
      >
        <Layers size={32} />
      </div>

      <div className="wishlist-info">
        <span className="wishlist-badge" style={{ fontSize: '0.65rem', padding: '2px 6px', marginBottom: '2px' }}>
          Combo Bundle
        </span>
        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{item.customName}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Contains: {products.map(p => p?.name).join(', ')}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
            ${discountedPrice.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
            ${originalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="cart-item-qty">
        <button 
          onClick={() => handleQtyChange(item.qty - 1)} 
          className="qty-btn"
          disabled={item.qty <= 1}
        >
          <Minus size={14} />
        </button>
        <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
        <button 
          onClick={() => handleQtyChange(item.qty + 1)} 
          className="qty-btn"
        >
          <Plus size={14} />
        </button>
      </div>

      <button 
        onClick={() => removeFromCart(item._id)} 
        className="btn btn-secondary"
        style={{ padding: '8px', color: '#ef4444', borderColor: 'var(--glass-border)', display: 'flex', alignItems: 'center' }}
        title="Remove Bundle"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
