import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToWishlist, addToCart, wishlist } = useApp();

  // Check if this product is already in the wishlist as a single item
  const isWishlisted = wishlist?.items?.some(
    (item) => item.type === 'single' && item.product && (item.product._id === product._id || item.product === product._id)
  );

  const handleAddToCart = () => {
    addToCart({
      type: 'single',
      productId: product._id
    });
  };

  return (
    <div className="product-card glass glass-interactive animate-scale-in">
      <div className="product-image-container">
        <span className="product-category">{product.category}</span>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/280x220/1a1b26/ffffff?text=' + encodeURIComponent(product.name);
          }}
        />
      </div>

      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <div className="product-rating">
            <Star size={14} fill="#fbbf24" stroke="none" />
            <span>{product.rating}</span>
          </div>
        </div>

        <div className="product-actions">
          <button onClick={handleAddToCart} className="btn btn-primary">
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
          
          <button 
            onClick={() => addToWishlist(product._id)} 
            className="btn btn-secondary"
            style={{ 
              padding: '10px', 
              color: isWishlisted ? '#f43f5e' : 'var(--text-muted)',
              borderColor: isWishlisted ? '#f43f5e' : 'var(--glass-border)',
              background: isWishlisted ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-tertiary)'
            }}
            title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            disabled={isWishlisted}
          >
            <Heart size={18} fill={isWishlisted ? '#f43f5e' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
