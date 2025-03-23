import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - item
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: The cart item ID
 *         item:
 *           type: array
 *           items:
 *             type: string
 *           description: List of item IDs in this cart item
 *         quantity:
 *           type: number
 *           description: The quantity of the item
 *           minimum: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the cart item was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the cart item was last updated
 */
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
