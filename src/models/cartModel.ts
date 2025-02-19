//carts
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    cartItem: {
      default: [],
      ref: "CartItem",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    user: {
      ref: "User",
      required: true,
      type: mongoose.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);
