import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState({ items: [] });
  const [cart, setCart] = useState({ items: [] });
  const [activeTab, setActiveTab] = useState('home');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Set up Axios interceptors for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setWishlist({ items: [] });
      setCart({ items: [] });
    }
  }, [token]);

  // Fetch initial products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch wishlist & cart once user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
      fetchCart();
    }
  }, [user]);

  // Toast notifications helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch current user details
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.error('Fetch user profile error:', err.response?.data?.message || err.message);
      // If token expired or invalid, logout
      logout();
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      showToast('Could not load products. Please check if the server is running.', 'error');
    }
  };

  // Fetch user wishlist
  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/wishlist`);
      setWishlist(res.data);
    } catch (err) {
      console.error('Fetch wishlist error:', err.message);
    }
  };

  // Fetch user cart
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/cart`);
      setCart(res.data);
    } catch (err) {
      console.error('Fetch cart error:', err.message);
    }
  };

  // User Auth - Register
  const registerUser = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      setToken(res.data.token);
      setUser({ _id: res.data._id, username: res.data.username, email: res.data.email });
      showToast('Registration successful! Welcome!', 'success');
      setActiveTab('home');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Auth - Login
  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser({ _id: res.data._id, username: res.data.username, email: res.data.email });
      showToast('Logged in successfully!', 'success');
      setActiveTab('home');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Invalid credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Auth - Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    setWishlist({ items: [] });
    setCart({ items: [] });
    showToast('Logged out successfully.', 'info');
    setActiveTab('home');
  };

  // Wishlist - Add Item
  const addToWishlist = async (productId) => {
    if (!token) {
      showToast('Please sign in to add items to your wishlist.', 'info');
      setActiveTab('auth');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/wishlist/add`, { productId });
      setWishlist(res.data);
      showToast('Added product to wishlist!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding to wishlist.', 'error');
    }
  };

  // Wishlist - Remove Item
  const removeFromWishlist = async (itemId) => {
    try {
      const res = await axios.delete(`${API_URL}/wishlist/${itemId}`);
      setWishlist(res.data);
      showToast('Removed from wishlist.', 'info');
    } catch (err) {
      showToast('Failed to remove item.', 'error');
    }
  };

  // Wishlist - Combine Items
  const combineWishlist = async (itemIds, customName, discount) => {
    try {
      const res = await axios.post(`${API_URL}/wishlist/combine`, {
        itemIds,
        customName,
        discount
      });
      setWishlist(res.data);
      showToast(`Successfully combined items into "${customName}"!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error combining items.', 'error');
    }
  };

  // Wishlist - Split Item
  const splitWishlist = async (itemId) => {
    try {
      const res = await axios.post(`${API_URL}/wishlist/split/${itemId}`);
      setWishlist(res.data);
      showToast('Split bundle back into individual items.', 'success');
    } catch (err) {
      showToast('Error splitting bundle.', 'error');
    }
  };

  // Cart - Add (Single or Combo)
  const addToCart = async (params) => {
    if (!token) {
      showToast('Please sign in to add items to your cart.', 'info');
      setActiveTab('auth');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/cart/add`, params);
      setCart(res.data);
      if (params.type === 'combined') {
        showToast(`Added custom bundle "${params.customName}" to your cart!`, 'success');
      } else {
        showToast('Added item to cart!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding to cart.', 'error');
    }
  };

  // Cart - Update Quantity
  const updateCartQty = async (itemId, qty) => {
    try {
      const res = await axios.put(`${API_URL}/cart/update/${itemId}`, { qty });
      setCart(res.data);
    } catch (err) {
      showToast('Error updating quantity.', 'error');
    }
  };

  // Cart - Remove Item
  const removeFromCart = async (itemId) => {
    try {
      const res = await axios.delete(`${API_URL}/cart/${itemId}`);
      setCart(res.data);
      showToast('Removed item from cart.', 'info');
    } catch (err) {
      showToast('Error removing item from cart.', 'error');
    }
  };

  // Cart - Checkout
  const handleCheckout = async () => {
    try {
      await axios.post(`${API_URL}/cart/checkout`);
      setCart({ items: [] });
      showToast('Order placed successfully! Check your email for receipt.', 'success');
    } catch (err) {
      showToast('Checkout failed.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        products,
        wishlist,
        cart,
        activeTab,
        toasts,
        loading,
        setActiveTab,
        showToast,
        registerUser,
        loginUser,
        logout,
        addToWishlist,
        removeFromWishlist,
        combineWishlist,
        splitWishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        handleCheckout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
