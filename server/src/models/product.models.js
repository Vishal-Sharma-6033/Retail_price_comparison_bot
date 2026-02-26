import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },

  { timestamps: true, strict: false },
);

productSchema.index({ name: "text", brand: "text", category: "text" });

export const Product = mongoose.model("Product", productSchema);
