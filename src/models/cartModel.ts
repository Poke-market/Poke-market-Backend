//carts
import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: The cart ID
 *         cartItem:
 *           type: array
 *           items:
 *             type: string
 *           description: List of cart item IDs in this cart
 *         user:
 *           type: string
 *           description: The ID of the user who owns this cart
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cart was last updated
 */
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
  },
);

export const Cart = mongoose.model("Cart", cartSchema);
