import mongoose, { Schema } from "mongoose";

const shopSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: {
      type:Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true, strict: false },
);

export const Shop = mongoose.model("Shop", shopSchema);
