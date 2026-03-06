# Retail Price Comparison Bot 🛍️

A full-stack MERN application that helps users find the best prices for products across multiple shops with real-time notifications, price tracking, and intelligent product management.

## ✨ Features

### 1. 🔍 Smart Product Search
- Search products across all registered shops
- Location-based nearby shop discovery
- Real-time price comparison
- Price history and trends

### 2. 📱 Price Tracking & Notifications  
- Add products to personal watchlist
- Get instant notifications when prices drop
- Price history charts with analytics
- Trend indicators (rising/declining/neutral)

### 3. 🤖 AI Price Bot
- Chat-based product inquiries
- Price comparison in natural language
- Smart product recommendations
- Location-aware responses

### 4. ✨ **NEW** - Automatic Duplicate Product Detection
- Prevents accidental product duplicates
- Normalized matching (case-insensitive, whitespace-tolerant)
- Owner-scoped deduplication
- Helpful error messages on conflict

### 5. 🗺️ **NEW** - Directions to Shop Feature
- Interactive map showing shop locations
- One-click navigation to any shop
- Distance calculation to nearest km
- Google Maps integration for turn-by-turn directions
- Mobile-friendly map interface

### 6. 📍 **NEW** - Auto-Geocoding Shop Locations
- Automatic address-to-coordinates conversion
- Manual location update option
- Batch geocoding utility
- Real shop coordinates on maps

## 🛠️ Tech Stack

### Backend
- **Node.js** (v16+)
- **Express.js** (server framework)
- **MongoDB** (NoSQL database with Atlas)
- **Mongoose** (ODM)
- **JWT** (authentication)
- **Google Maps API** (geocoding)
- **OpenStreetMap** (mapping)

### Frontend
- **React** (v18)
- **Vite** (build tool)
- **Axios** (HTTP client)
- **React Router** (navigation)
- **ApexCharts** (price charts)
- **Leaflet** (interactive maps)

### Architecture
```
┌──────────────────────────────────────────┐
│          Frontend (React + Vite)         │
│  - Home: Search & Price Comparison       │
│  - Dashboard: Shopkeeper Management      │
│  - Profile: Watchlist & Notifications    │
│  - Map: Directions to Shops              │
└──────────────────────────────────────────┘
              ↕ (Axios)
┌──────────────────────────────────────────┐
│         Backend (Express.js)             │
│  - Auth: JWT-based authentication        │
│  - Products: Create, List, Search        │
│  - Shops: Create, Nearby, Geocode        │
│  - Prices: Track, History, Notifications │
│  - Chatbot: Price inquiries              │
└──────────────────────────────────────────┘
              ↕ (Mongoose)
┌──────────────────────────────────────────┐
│      Database (MongoDB Atlas)            │
│  - Users, Products, Shops, Prices        │
│  - PriceHistory, Notifications           │
└──────────────────────────────────────────┘
```

## 📦 Installation

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher
- MongoDB Atlas account (free tier available)
- Google Maps API key (optional, for geocoding)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/retail-price-comparison-bot.git
cd Retail_price_comparison_bot
```

### 2. Setup Environment

**Server Configuration** (`server/.env`)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
GEOCODE_API_KEY=your_geocoding_api_key
NODE_ENV=development
PORT=5000
```

**Client Configuration** (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start Servers

**Option A: Manual (Two Terminals)**

Terminal 1:
```bash
cd server
npm start
```

Terminal 2:
```bash
cd client
npm run dev
```

**Option B: Quick Start Script**
```bash
chmod +x start.sh
./start.sh
```

### 5. Access Application
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## 🚀 Usage Guide

### For Customers

#### 1. Search Products
1. Go to Home page
2. Enter product name in search bar
3. Optionally click "Use your location" to see nearby shops
4. Results show all available shops with prices

#### 2. Get Directions to Shop
1. In search results, click **"📍 Show Route"** button
2. Interactive map opens showing:
   - 📍 Your location (blue marker)
   - 🏪 Shop location (red marker)
   - Distance in kilometers
3. Click **"📲 Open in Google Maps"** for navigation

#### 3. Track Prices
1. Click **"Watch"** button on any product
2. Go to Profile page → Watchlist
3. Get notified when prices drop
4. View price history and trends

#### 4. Ask Price Bot
1. Open the bot panel on Home page
2. Ask natural language questions:
   - "Show me gaming mice under 1000"
   - "Where's the cheapest phone?"
   - "What's the trend for laptops?"

### For Shopkeepers

#### 1. Create Shop
1. Go to Dashboard
2. Fill "Create Shop" form with:
   - Shop name
   - Address (required for geocoding)
   - Phone number
3. Click "Save shop"
4. Location auto-detected from address ✓

#### 2. Fix Shop Location
1. In "My Shops" table:
   - "✓ Set" = Location detected
   - "📍 Fix" = Needs geocoding
2. Click "📍 Fix" button
3. Wait for update confirmation ✓

#### 3. Add Products
1. Go to Dashboard → "Add Product"
2. Enter:
   - Product name (required)
   - Brand (optional)
   - Category (optional)
3. System prevents duplicates automatically
4. Click "Add product"

#### 4. Set Prices
1. In "Add Price Listing" section:
   - Select your shop
   - Select product
   - Enter price
   - Choose currency
2. Click "Update price"
3. Price tracked in history
4. Watchers notified if price drops

## 📚 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register
GET  /api/users/me
```

### Products
```
GET    /api/products              # List all
GET    /api/products/search?q=    # Search with location
POST   /api/products              # Create (auth required)
DELETE /api/products/:productId   # Delete (owner only)
GET    /api/products/mine         # My products (auth)
```

### Shops  
```
GET    /api/shops/nearby?lat=&lng=&radius=   # Nearby shops
GET    /api/shops/geocode?address=           # Geocode address
POST   /api/shops                            # Create (auth)
PATCH  /api/shops/:shopId/location           # Fix location (auth)
DELETE /api/shops/:shopId                    # Delete (owner)
GET    /api/shops/mine                       # My shops (auth)
```

### Prices
```
GET    /api/prices?productId=&shopId=        # List prices
POST   /api/prices                           # Create/Update (auth)
GET    /api/prices/history/:productId        # Price history
```

### Notifications
```
GET    /api/notifications         # Get notifications (auth)
PATCH  /api/notifications/:id/read # Mark as read (auth)
```

### Watchlist
```
GET    /api/users/watchlist                  # My watchlist
POST   /api/users/watchlist                  # Add product
DELETE /api/users/watchlist/:productId       # Remove product
```

## 🧪 Testing

### Run Tests
```bash
cd server
npm test

cd ../client
npm test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Product search with location
- [ ] Price comparison table loads
- [ ] Directions map opens with correct locations
- [ ] Distance calculation is accurate
- [ ] Shop location fix button works
- [ ] Duplicate product detection blocks duplicates
- [ ] Price notifications send correctly
- [ ] Watchlist add/remove works
- [ ] Price history charts display
- [ ] Chatbot responds to queries

## 📁 Project Structure

```
Retail_price_comparison_bot/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── ComparisonTable.jsx
│   │   │   ├── DirectionsMap.jsx    # NEW
│   │   │   ├── ChatbotPanel.jsx
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── geolocation.js       # NEW
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── styles/
│   │       └── app.css
│   └── package.json
│
├── server/                          # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Shop.js
│   │   │   ├── PriceListing.js
│   │   │   └── ...
│   │   ├── controllers/             # Business logic
│   │   │   ├── productController.js
│   │   │   ├── shopController.js    # UPDATED
│   │   │   └── ...
│   │   ├── routes/                  # API routes
│   │   │   ├── productRoutes.js
│   │   │   ├── shopRoutes.js        # UPDATED
│   │   │   └── ...
│   │   ├── middleware/              # Middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── roles.js
│   │   ├── config/
│   │   │   └── db.js
│   │   └── index.js
│   ├── scripts/
│   │   └── geocode-shops.js         # NEW
│   ├── .env
│   └── package.json
│
├── FEATURES.md                      # Feature guide (NEW)
├── IMPLEMENTATION_SUMMARY.md        # Implementation details (NEW)
├── README.md                        # This file
└── start.sh                         # Quick start script (NEW)
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:** Check MongoDB URI in `.env` and ensure connection from your IP

### Map Shows "Loading map....." Forever
```
Solution: Latest version fixed this issue.
Clear browser cache: Ctrl+Shift+Delete
Refresh: Ctrl+R
```

### Geolocation Permission Denied
**Browser Settings:**
- Chrome: Settings → Privacy → Location
- Firefox: Preferences → Privacy
- Safari: Preferences → Privacy

Allow `localhost:5173`

### Shop Locations Still 0,0
**Run batch geocoding utility:**
```bash
cd server
node scripts/geocode-shops.js
```

Or use Dashboard "📍 Fix" button for each shop

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: "customer" | "shopkeeper" | "admin",
  watchlist: [ObjectId], // Product IDs
  createdAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  brand: String,
  category: String,
  description: String,
  owner: ObjectId, // User who created
  createdAt: Date
}
```

### Shop
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  phone: String,
  location: {
    type: "Point",
    coordinates: [lng, lat] // GeoJSON
  },
  owner: ObjectId,
  createdAt: Date
}
```

### PriceListing
```javascript
{
  _id: ObjectId,
  product: ObjectId,
  shop: ObjectId,
  price: Number,
  currency: String,
  inStock: Boolean,
  lastUpdated: Date,
  createdAt: Date
}
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ Input validation & sanitization
- ✅ Owner-scoped operations
- ✅ Environment variables for secrets
- ✅ CORS enabled for frontend

## 📈 Performance Optimization

- ✅ Text indexing on Products
- ✅ 2dsphere index on Shop locations
- ✅ Query optimization with lean()
- ✅ Client-side caching with localStorage
- ✅ Lazy loading of price history
- ✅ Map tile caching (Leaflet)

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Edge    | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Mobile  | ✅ Full |

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push: `git push origin feature/name`
4. Create Pull Request

## 📄 License

MIT License - Feel free to use this project!

## 📧 Support

For bugs and feature requests, please open an issue on GitHub.

---

**Made with ❤️ in India 🇮🇳**

Latest Update: March 6, 2026
- ✅ Duplicate product detection
- ✅ Directions to shop feature  
- ✅ Auto-geocoding for shops
