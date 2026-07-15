# VibeShop — v1 Product & Technical Specification

**Date:** July 15, 2026 (Project Kickoff)  
**Author:** Abhinav  
**Status:** Approved / Archive (Pre-Build Phase)

---

## 1. Project Overview & Objective

We are building an e-commerce platform called **VibeShop** using React, CSS, Express, and MongoDB. The primary differentiator of this store is its **Wishlist Combination System**. 

While normal stores let users add items to a cart from their wishlist, VibeShop will let users select distinct items within their wishlist, combine them into a single "bundle" with a custom name and bundle discount, and purchase the entire set at once.

---

## 2. Key Features (Initial Scope)

1. **Product Catalog**: Standard grid layout listing products with images, prices, details, ratings, and stock count.
2. **Wishlist**: Simple wishlist view. User can add products to the wishlist.
3. **Wishlist Combiner (Core Focus)**:
   - When viewing the wishlist, users see checkboxes next to each item.
   - The user selects **two distinct items** from the list.
   - A "Combine Items" button becomes active.
   - Clicking it triggers a modal showing the selected items side-by-side, the calculated price savings (default 10% discount), and a text box to give the new combination bundle a custom name (e.g., "Bedroom Audio Setup").
   - Confirming merges them into a single visual bundle card in the wishlist.
   - The bundle card has a "Split Bundle" button (to separate them back into individual wishlist items) and a "Buy Bundle" button.
4. **Cart**: Standard shopping cart listing single items and combined bundle items with quantity modifiers.
5. **Checkout**: A simplified card checkout form simulating shipping details and validation.

---

## 3. Tech Stack

- **Frontend**: Vite + React, Vanilla CSS (Modern glassmorphic UI, responsive layouts, hover lift micro-animations).
- **Backend**: Node.js + Express.js API.
- **Database**: MongoDB + Mongoose schemas (supporting local connection or a local fallback mock data engine if MongoDB is offline during testing).
- **Client-Server Comm**: Axios with JWT authorization headers.

---

## 4. First-Pass Schema Design (v1 Draft)

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  rating: Number,
  countInStock: Number
}
```

### Wishlist Schema (First Pass)
*Note: Our initial assumption is that the wishlist only merges exactly **two** items at a time, so the schema is modeled with explicit product reference slots.*
```javascript
{
  user: ObjectId (ref User),
  items: [{
    type: { type: String, enum: ['single', 'combined'] },
    product: ObjectId (ref Product), // used if type is 'single'
    // First-pass: explicitly link two items for combinations
    combinedItemA: ObjectId (ref Product), // used if type is 'combined'
    combinedItemB: ObjectId (ref Product), // used if type is 'combined'
    customName: String,
    discount: Number (default 10)
  }]
}
```
> [!WARNING]
> *Refactoring Risk:* If the user requests merging 3 or more items, or adding a third item to an existing 2-item bundle, the `combinedItemA`/`combinedItemB` structure will fail. We will likely need to refactor this into a flat array of product IDs (`products: [ObjectId]`) during implementation to support arbitrary multi-item bundles.

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String
}
```

---

## 5. Security & Session Plan

- Implement basic user registration and login.
- Store password hashes in MongoDB.
- Generate standard session cookies or JSON Web Tokens (JWT) saved in the frontend's `localStorage` to authorize wishlist/cart requests.

---

## 6. Open Technical Questions

1. **How do combined items interact with the Cart?**
   Should they split into individual products in the cart, or remain as a single "Custom Bundle" item with a reduced subtotal? 
   *Decision:* Keep them grouped as a customized "Bundle" cart item with its own total price and savings details. This makes checkout clean and preserves the customized name.
2. **Dynamic UI Connector:**
   We need a cool way to visually represent bundles in the wishlist. We'll design a wide card containing thumbnails of all products in the bundle connected by a neon `+` sign.
