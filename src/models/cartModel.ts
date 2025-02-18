//carts
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    cartItem: {
      type: [mongoose.Types.ObjectId],
      ref: "CartItem",
      required: true,
      default: [],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);
