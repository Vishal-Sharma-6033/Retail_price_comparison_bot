# Retail Price Comparison Bot

A full-stack MERN application that helps users find the best prices for products across local shops.

Users can search products, compare prices, check price trends, get shop directions, and track watchlist updates. Shopkeepers can manage shops, products, and pricing from a protected dashboard with subscription support.

## What This Project Solves

In local markets, customers usually check multiple shops manually to find the lowest price. This project centralizes product listings and prices in one place so users can make faster and better buying decisions.

## Core Features

### Customer Features

- Product search with price comparison across shops
- Location-aware results for nearby shops
- Price trend chart and history analytics
- Watchlist for tracking products
- Notifications for price updates
- Chatbot for quick product and pricing queries
- Directions to shop using map integration

### Shopkeeper Features

- Secure dashboard access (role-based)
- Create and manage shops
- Add and manage products
- Create/update price listings
- Auto geocoding and manual shop location fix
- Duplicate product prevention
- Subscription upgrade flow (Razorpay)

## Tech Stack

### Frontend

- React 18 + Vite
- React Router DOM
- Axios
- ApexCharts / React ApexCharts
- Leaflet + Leaflet Routing Machine
- Socket.IO Client

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Razorpay
- Helmet, CORS, Morgan

## Project Structure

```text
Retail_price_comparison_bot/
|- client/                # React frontend
|  |- src/
|     |- pages/           # Home, Dashboard, Profile, Auth pages
|     |- components/      # UI components (table, chart, chatbot, map, etc.)
|     |- context/         # Auth context
|     |- api/             # Axios API modules
|     |- services/        # socket/geolocation helpers
|
|- server/                # Express backend
|  |- src/
|     |- routes/          # API route modules
|     |- controllers/     # Business logic
|     |- models/          # Mongoose schemas
|     |- middleware/      # auth, roles, error handling
|     |- config/          # DB config
|     |- utils/           # helpers (JWT, subscription)
|     |- socket.js        # realtime setup
|
|- start.sh               # quick start script
```

## How It Works (Flow)

1. User opens the React app and searches for a product.
2. Frontend sends request to Express API via Axios.
3. Backend queries MongoDB for product, shops, and price listings.
4. Results are returned and shown in a comparison table.
5. User can:
   - Open trend chart using price history
   - Add product to watchlist
   - Open directions to selected shop
   - Ask chatbot questions
6. Shopkeeper can login to dashboard and maintain shops/products/prices.

## Authentication and Roles

- JWT token-based login/register
- Protected frontend routes for authenticated users
- Backend middleware checks user role
- Shop management and price updates are restricted to `shopkeeper` / `admin`

## API Modules

- `/api/auth` - register and login
- `/api/users` - profile, watchlist, insights
- `/api/products` - list, search, create, delete, my products
- `/api/shops` - nearby, search, create, geocode, location update, mine
- `/api/prices` - list, upsert, history
- `/api/chatbot` - chatbot query
- `/api/notifications` - list and mark read
- `/api/subscriptions` - plan details, create order, verify payment

## Setup and Run

### Prerequisites

- Node.js 16+
- npm 7+
- MongoDB connection string

### Environment Variables

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=5000

# optional integrations
GEOCODE_API_KEY=your_maps_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Install Dependencies

```bash
npm install
npm --workspace server install
npm --workspace client install
```

### Run in Development

```bash
npm run dev
```

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:5000`

## Demo Use Cases

### Customer Journey

1. Login/Register
2. Search a product
3. Compare prices across shops
4. View trend chart
5. Add to watchlist
6. Open route to shop

### Shopkeeper Journey

1. Login as shopkeeper
2. Create shop
3. Add products
4. Update prices
5. Upgrade subscription when needed

## Why This Is a Strong Project

- Real-world problem solving
- Full-stack architecture with clear separation of concerns
- Role-based secure flows
- Geolocation + maps + analytics + chatbot + realtime updates
- Payment integration for monetization

## 📄 Research Paper

This project is backed by a research paper explaining the methodology, architecture, and results.

📥 [Read Full Paper (PDF)](link-to-your-paper.pdf)

## Author

Vishal Sharma
