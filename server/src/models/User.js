const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "shopkeeper", "admin"],
      default: "customer"
    },
    watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    recentSearches: [
      {
        query: { type: String, required: true, trim: true },
        address: { type: String, trim: true },
        searchedAt: { type: Date, default: Date.now }
      }
    ],
    totalSearches: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
