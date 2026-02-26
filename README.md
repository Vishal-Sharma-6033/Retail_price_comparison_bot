# Retail Price Comparison Bot for Local Markets

A full-stack MERN application that lets customers compare product prices across nearby local shops, chat with a price bot, and track price trends.

## Features
- Product search with location-based filtering
- Price comparison table and trend chart
- Chatbot for quick price queries
- JWT authentication and role-based access (customer, shopkeeper, admin)
- Shopkeeper dashboard to add or update prices
- Price history tracking and price drop notifications
- Clean REST APIs with error handling

## Project Structure
- client: React frontend
- server: Node.js/Express backend

## Setup
1. Install dependencies:
   - From the project root: npm install
2. Create environment files:
   - server/.env (see server/.env.example)
   - client/.env (see client/.env.example)
3. Start the app:
   - npm run dev

## Notes
- You need a MongoDB connection string.
- To enable address geocoding, set GOOGLE_MAPS_API_KEY in the server .env.
