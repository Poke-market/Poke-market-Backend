import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    item: {
      default: [],
      ref: "Item",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    quantity: { required: true, type: Number },
  },
  {
    timestamps: true,
  },
);

export const CartItem = mongoose.model("CartItem", cartItemSchema);
