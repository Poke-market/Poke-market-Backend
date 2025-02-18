import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    cart: {
      type: [mongoose.Types.ObjectId],
      ref: "Cart",
      required: true,
      default: [],
    },
    status: { type: String, required: true, trim: true },
    enum: ["pending", "completed", "cancelled"],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
