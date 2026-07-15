import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Split, Trash2, Plus, Star } from 'lucide-react';

export default function WishlistCard({ item, isSelected, onSelectToggle }) {
  const { removeFromWishlist, splitWishlist, addToCart } = useApp();

  const handleAddToCart = () => {
    if (item.type === 'single') {
      addToCart({
        type: 'single',
        productId: item.product._id
      });
    } else {
      addToCart({
        type: 'combined',
        productIds: item.products.map((p) => p._id),
        customName: item.customName,
        discount: item.discount
      });
    }
  };

  if (item.type === 'single') {
    const product = item.product;
    if (!product) return null;

    return (
      <div className={`wishlist-card glass animate-scale-in`}>
        <div className="wishlist-checkbox-wrapper">
          <input 
            type="checkbox" 
            className="custom-checkbox" 
            checked={isSelected}
            onChange={() => onSelectToggle(item._id)}
          />
        </div>

        <div className="wishlist-img">
          <img 
            src={product.image} 
            alt={product.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/100x100/1a1b26/ffffff?text=' + encodeURIComponent(product.name);
            }}
          />
        </div>

        <div className="wishlist-info">
          <h3 style={{ fontSize: '1.15rem' }}>{product.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{product.category}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
              ${product.price.toFixed(2)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#fbbf24' }}>
              <Star size={12} fill="#fbbf24" stroke="none" />
              <span>{product.rating}</span>
            </div>
          </div>
        </div>

        <div className="wishlist-actions">
          <button onClick={handleAddToCart} className="btn btn-primary">
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
          
          <button 
            onClick={() => removeFromWishlist(item._id)} 
            className="btn btn-secondary"
            style={{ padding: '10px', color: '#ef4444', borderColor: 'var(--glass-border)' }}
            title="Remove from Wishlist"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Combined Bundle Card
  const products = item.products || [];
  const originalPrice = products.reduce((sum, p) => sum + (p?.price || 0), 0);
  const discountedPrice = originalPrice * (1 - (item.discount || 0) / 100);

  return (
    <div className={`wishlist-card combo-active glass animate-scale-in`}>
      <div className="wishlist-checkbox-wrapper">
        <input 
          type="checkbox" 
          className="custom-checkbox" 
          checked={isSelected}
          onChange={() => onSelectToggle(item._id)}
        />
      </div>

      <div className="wishlist-combo-products">
        {products.map((prod, index) => (
          <React.Fragment key={prod?._id || index}>
            {index > 0 && <span className="combo-connector"><Plus size={20} /></span>}
            <div 
              className="wishlist-img" 
              title={prod?.name} 
              style={{ border: '2px solid rgba(168, 85, 247, 0.3)', position: 'relative' }}
            >
              <img 
                src={prod?.image} 
                alt={prod?.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100x100/1a1b26/ffffff?text=' + encodeURIComponent(prod?.name || '');
                }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="wishlist-info">
        <span className="wishlist-badge">{item.discount}% Off Bundle</span>
        <h3 style={{ fontSize: '1.25rem', marginTop: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {item.customName}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            ({products.length} Items)
          </span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          Contains: {products.map(p => p?.name).join(', ')}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
            ${discountedPrice.toFixed(2)}
          </span>
          <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
            ${originalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="wishlist-actions">
        <button onClick={handleAddToCart} className="btn btn-accent">
          <ShoppingCart size={16} />
          <span>Add Combo to Cart</span>
        </button>

        <button 
          onClick={() => splitWishlist(item._id)} 
          className="btn btn-secondary"
          style={{ padding: '10px 14px', display: 'inline-flex', gap: '6px', color: 'var(--color-secondary)' }}
          title="Split bundle back into single items"
        >
          <Split size={16} />
          <span style={{ fontSize: '0.85rem' }}>Split</span>
        </button>
        
        <button 
          onClick={() => removeFromWishlist(item._id)} 
          className="btn btn-secondary"
          style={{ padding: '10px', color: '#ef4444', borderColor: 'var(--glass-border)' }}
          title="Remove Combo"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
