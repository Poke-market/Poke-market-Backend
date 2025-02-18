import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    item: {
      type: [mongoose.Types.ObjectId],
      ref: "Item",
      required: true,
      default: [],
    },
    quantity: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export const CartItem = mongoose.model("CartItem", cartItemSchema);
