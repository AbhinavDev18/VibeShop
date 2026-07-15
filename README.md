# 🛍️ VibeShop — E-Commerce with Wishlist Bundle Merging

VibeShop is a premium, glassmorphic e-commerce platform built using the **MERN** stack (React, CSS, Axios, Express, and MongoDB). 

Beyond standard e-commerce features (listings, carts, user accounts, and checking out), VibeShop introduces a **custom Wishlist Combination System** that allows shoppers to group wishlist items into discounted bundles and purchase them together in one click.

---

## ✨ Features

- **🔒 Full Authentication**: User registration and login with secure password hashing (`bcryptjs`) and persistent JWT session tokens.
- **💎 Glassmorphic UI**: Sleek dark/light theme options, responsive product grids, and glowing border animations.
- **⚡ Local Database Fallback**: Dynamically falls back to an in-memory mock database if local MongoDB is offline, allowing instant local testing without setting up databases.
- **⚡ Advanced Wishlist Bundles (Core Feature)**:
  - Select any number of wishlist items using checkboxes.
  - Combine multiple items into a single bundle.
  - Flatten and merge single items into existing bundles.
  - Set custom bundle names and select custom reward discounts (5% to 20%).
  - Split bundles back into single wishlist items instantly.
  - Add entire bundles directly to the cart as a single line item, calculating combined discount prices during checkout.

---

## 🛠️ Tech Stack

- **Frontend**: ReactJS, Vanilla CSS (Design System), Axios, Lucide Icons, Vite
- **Backend**: Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), bcryptjs
- **Database**: MongoDB (Mongoose Schema) or Local Memory Fallback

---

## 🚀 Setup & Installation

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbhinavDev18/VibeShop.git
   cd VibeShop
   ```

2. **Start the Backend Server:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   *The server will boot on `http://localhost:5000`. If local MongoDB is running at `mongodb://127.0.0.1:27017`, it connects automatically. Otherwise, it loads the memory mock DB.*

3. **Start the Frontend Application:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *Vite will start the client app on `http://localhost:5173`. Open this URL in your browser.*

---

## ☁️ Vercel Deployment

### 📋 Deploy as a Single Project (Recommended)
Yes, you should deploy this as **one single project** on Vercel. 

Thanks to our root-level `vercel.json` configuration, Vercel knows how to build both the static React client and mount the serverless Express API function automatically under a single domain. This keeps routes clean and eliminates CORS issues!

### 🔧 Steps to Deploy:
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** > **Project** and import the `VibeShop` GitHub repository.
3. **Project Settings**:
   - Keep the Root Directory as `/` (do **not** change it to `frontend` or `backend`).
   - Vercel will automatically read the root-level `vercel.json` configuration.
4. **Environment Variables** (Optional):
   - Add `JWT_SECRET` (any secret key string) to secure JWT signatures.
   - Add `MONGO_URI` (your MongoDB Atlas connection string). If left empty, the deployment will run using the cloud serverless in-memory mock database.
5. Click **Deploy**. Vercel will build the React site and serve your Express routes under `https://your-domain.vercel.app/api`.
