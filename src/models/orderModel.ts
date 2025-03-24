import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderStatus:
 *       type: string
 *       enum: [pending, completed, cancelled]
 *       description: Status of an order
 *
 *     Order:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: The order ID
 *         cart:
 *           type: array
 *           items:
 *             type: string
 *           description: List of cart IDs associated with this order
 *         status:
 *           $ref: '#/components/schemas/OrderStatus'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the order was last updated
 */
const orderSchema = new mongoose.Schema(
  {
    cart: {
      default: [],
      ref: "Cart",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["pending", "completed", "cancelled"],
    },
  },
  {
    timestamps: true,
  },
);

export const Order = mongoose.model("Order", orderSchema);
