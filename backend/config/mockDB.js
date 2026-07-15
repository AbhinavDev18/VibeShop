const mockDB = {
  users: [],
  products: [
    {
      _id: 'prod1',
      name: 'Sleek Wireless Headphones',
      description: 'Experience pure audio bliss with premium active noise-cancelling wireless headphones. Crafted with memory-foam ear cushions and tuned for deep bass, crisp highs, and dynamic acoustics.',
      price: 199.99,
      image: '/images/headphones.png',
      category: 'Electronics',
      rating: 4.8,
      countInStock: 15
    },
    {
      _id: 'prod2',
      name: 'Mechanical Gaming Keyboard',
      description: 'Dominate your games with tactile responsiveness. Features clicky mechanical blue switches, fully customizable RGB per-key backlighting, and a premium brushed aluminum top frame.',
      price: 129.99,
      image: '/images/keyboard.png',
      category: 'Accessories',
      rating: 4.6,
      countInStock: 8
    },
    {
      _id: 'prod3',
      name: 'Minimalist Smart Watch',
      description: 'Stay connected in style. Track health metrics, monitor sleep, receive notifications, and customize your AMOLED circular display. Encased in black steel with a premium leather band.',
      price: 249.99,
      image: '/images/watch.png',
      category: 'Wearables',
      rating: 4.7,
      countInStock: 12
    },
    {
      _id: 'prod4',
      name: 'Premium Smart Speaker',
      description: 'Fill any room with rich 360-degree sound and voice assistant convenience. Equipped with deep bass radiators and an elegant glowing blue LED status ring.',
      price: 89.99,
      image: '/images/speaker.png',
      category: 'Electronics',
      rating: 4.5,
      countInStock: 20
    }
  ],
  wishlists: {}, // userId -> array of wishlist items
  carts: {} // userId -> array of cart items
};

module.exports = mockDB;
