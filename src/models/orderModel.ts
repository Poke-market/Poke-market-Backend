import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    cart: {
      default: [],
      ref: "Cart",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    enum: ["pending", "completed", "cancelled"],
    status: { required: true, trim: true, type: String },
  },
  {
    timestamps: true,
  },
);

export const Order = mongoose.model("Order", orderSchema);
