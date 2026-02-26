const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
