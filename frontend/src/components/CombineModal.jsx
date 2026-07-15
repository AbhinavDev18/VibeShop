import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles } from 'lucide-react';

export default function CombineModal({ selectedItems, onClose }) {
  const { combineWishlist } = useApp();
  const [customName, setCustomName] = useState('');
  const [discount, setDiscount] = useState(10); // default 10% discount

  // Extract all products from selected items (flattening any already combined items)
  const allProducts = [];
  selectedItems.forEach((item) => {
    if (item.type === 'single' && item.product) {
      allProducts.push(item.product);
    } else if (item.type === 'combined' && item.products) {
      item.products.forEach((p) => {
        if (p) allProducts.push(p);
      });
    }
  });

  // Calculate prices
  const originalTotal = allProducts.reduce((sum, p) => sum + p.price, 0);
  const savings = originalTotal * (discount / 100);
  const finalPrice = originalTotal - savings;

  // Generate a default name based on category or items length
  useEffect(() => {
    if (allProducts.length > 0) {
      const names = allProducts.slice(0, 2).map((p) => p.name.split(' ').slice(-1)[0]);
      const defaultName = `${names.join(' & ')} Combo Setup`;
      setCustomName(defaultName);
    }
  }, [selectedItems]);

  const handleConfirm = () => {
    const itemIds = selectedItems.map((item) => item._id);
    combineWishlist(itemIds, customName, discount);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass animate-scale-in" style={{ border: '1px solid var(--color-accent)' }}>
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <h2 className="modal-title" style={{ color: 'var(--color-accent)' }}>
          <Sparkles size={24} />
          <span>Create Custom Bundle</span>
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
            You are combining {selectedItems.length} items (containing {allProducts.length} distinct products) into a single wishlist bundle:
          </p>
          
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {allProducts.map((p, index) => (
              <div 
                key={p._id + index} 
                style={{ 
                  flexShrink: 0,
                  width: '60px', 
                  height: '60px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={p.name}
              >
                <img 
                  src={p.image} 
                  alt={p.name} 
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/60x60/1a1b26/ffffff?text=' + encodeURIComponent(p.name);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bundle Name</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. My Workspace Combo"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bundle Discount (Rewarding Combination!)</label>
          <div className="discount-selectors">
            {[5, 10, 15, 20].map((d) => (
              <button 
                key={d}
                type="button" 
                className={`discount-btn ${discount === d ? 'selected' : ''}`}
                onClick={() => setDiscount(d)}
              >
                {d}% Off
              </button>
            ))}
          </div>
        </div>

        <div className="modal-summary">
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Original Total Price:</span>
            <span>${originalTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row" style={{ color: '#10b981' }}>
            <span>Bundle Discount Savings ({discount}%):</span>
            <span>-${savings.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--color-secondary)' }}>Combined Bundle Price:</span>
            <span style={{ color: 'var(--color-secondary)' }}>${finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn btn-accent">
            Confirm Combination
          </button>
        </div>
      </div>
    </div>
  );
}
