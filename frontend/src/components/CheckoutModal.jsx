import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';

export default function CheckoutModal({ onClose }) {
  const { cart, handleCheckout, setActiveTab } = useApp();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [address, setAddress] = useState('');

  // Cart summary calculations
  const items = cart?.items || [];
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !cardNumber || !expiry || !cvv || !address) {
      alert('Please fill out all payment and shipping fields.');
      return;
    }
    
    setLoading(true);
    setTimeout(async () => {
      await handleCheckout();
      setLoading(false);
      setSuccess(true);
    }, 2000); // Simulate network latency
  };

  const handleBackToStore = () => {
    setActiveTab('home');
    onClose();
  };

  if (success) {
    return (
      <div className="modal-overlay animate-fade-in">
        <div className="modal-content glass animate-scale-in" style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <CheckCircle size={80} color="#10b981" style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Your order has been placed. We've received your bundle items purchase and are preparing them for shipment!
          </p>
          <button onClick={handleBackToStore} className="btn btn-primary" style={{ width: '100%' }}>
            Back to Home Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content glass animate-scale-in" style={{ maxWidth: '640px' }}>
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <h2 className="modal-title" style={{ color: 'var(--color-primary)' }}>
          <CreditCard size={24} />
          <span>Checkout & Secure Payment</span>
        </h2>

        <div className="cart-layout" style={{ gridTemplateColumns: '1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="modal-summary" style={{ margin: 0, padding: '16px' }}>
            <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShoppingBag size={16} />
              <span>Order Summary ({items.length} items)</span>
            </div>
            
            <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '12px' }}>
              {items.map((item, index) => {
                const nameStr = item.type === 'single' ? item.product?.name : item.customName;
                const priceNum = item.type === 'single' 
                  ? (item.product?.price || 0)
                  : (item.products?.reduce((acc, p) => acc + (p?.price || 0), 0) * (1 - (item.discount || 0) / 100));
                
                return (
                  <div key={item._id || index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{nameStr} (x{item.qty})</span>
                    <span>${(priceNum * item.qty).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="summary-row" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
              <span>${originalSubtotal.toFixed(2)}</span>
            </div>
            {discountSavings > 0 && (
              <div className="summary-row" style={{ fontSize: '0.85rem', color: '#10b981' }}>
                <span>Bundle Discount Savings:</span>
                <span>-${discountSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row" style={{ paddingTop: '8px', marginTop: '8px', borderTop: '1px solid var(--glass-border)', fontWeight: 'bold', fontSize: '1.05rem' }}>
              <span>Total Payment:</span>
              <span style={{ color: 'var(--color-primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Shipping Address</label>
            <textarea 
              className="form-input" 
              placeholder="Enter your street address, city, state, and zip code"
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: 'none' }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Name on Card</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength="19"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="MM/YY"
                maxLength="5"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="XXX"
                maxLength="3"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing Securely...' : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
