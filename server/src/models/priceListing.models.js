import mongoose, { Schema } from "mongoose";

const priceListingSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    price: {
      type: Number,
      required: true,
    },
    currency: { type: String, default: "INR" },
    inStock: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, strict: false },
);

export const PriceListing = mongoose.model("PriceListing", priceListingSchema);
