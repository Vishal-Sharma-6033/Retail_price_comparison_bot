/**
 * Script to geocode existing shops with missing coordinates
 * Run: node scripts/geocode-shops.js
 */

require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Shop = require("../src/models/Shop");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GEOCODE_API_KEY || "";

const geocodeAddress = async (address) => {
  if (!address || !GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const encoded = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const payload = await response.json();

    if (payload.results && payload.results.length > 0) {
      const { lat, lng } = payload.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
  }

  return null;
};

const fixShops = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/rpcb";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    // Find shops with invalid coordinates (0,0 or missing)
    const shopsToFix = await Shop.find({
      $or: [
        { "location.coordinates": [0, 0] },
        { "location.coordinates": { $exists: false } },
        { address: { $exists: true, $ne: "" } }
      ]
    });

    console.log(`📍 Found ${shopsToFix.length} shops to geocode`);

    if (!GOOGLE_MAPS_API_KEY) {
      console.log("⚠️  Google Maps API key not found in .env");
      console.log("   Set GOOGLE_MAPS_API_KEY=your_key to auto-geocode shops");
      console.log("\n📌 Manual Fix:");
      console.log("   You can update shops with addresses manually or get an API key:\n");
      shopsToFix.forEach((shop) => {
        console.log(`   Shop: ${shop.name}`);
        console.log(`   Address: ${shop.address || "N/A"}\n`);
      });
    } else {
      let fixed = 0;
      for (const shop of shopsToFix) {
        if (!shop.address) continue;

        const coords = await geocodeAddress(shop.address);
        if (coords) {
          await Shop.findByIdAndUpdate(shop._id, {
            location: {
              type: "Point",
              coordinates: [coords.longitude, coords.latitude]
            }
          });
          console.log(`✓ Updated: ${shop.name} (${shop.address})`);
          fixed++;
        } else {
          console.log(`✗ Failed: ${shop.name} (${shop.address})`);
        }

        // Add small delay to avoid API limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`\n✓ Fixed ${fixed}/${shopsToFix.length} shops`);
    }

    await mongoose.connection.close();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

fixShops();
