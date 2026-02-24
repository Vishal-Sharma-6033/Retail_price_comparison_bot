import mongoose, { Schema } from "mongoose";

const priceHistorySchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, strict: false },
);

export const PriceHistory = mongoose.model("PriceHistory", priceHistorySchema);
