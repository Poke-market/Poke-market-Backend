import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstname
 *         - lastname
 *         - password
 *         - street
 *         - housenumber
 *         - city
 *         - zipcode
 *         - telephone
 *       properties:
 *         _id:
 *           type: string
 *           description: The user ID
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address (unique)
 *         firstname:
 *           type: string
 *           description: The user's first name
 *         lastname:
 *           type: string
 *           description: The user's last name
 *         street:
 *           type: string
 *           description: Street name
 *         housenumber:
 *           type: string
 *           description: House number
 *         city:
 *           type: string
 *           description: City
 *         zipcode:
 *           type: string
 *           description: Postal/ZIP code
 *         telephone:
 *           type: string
 *           description: Telephone number
 *         avatar:
 *           type: string
 *           description: URL to the user's avatar image
 *           default: https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png
 *         wishList:
 *           type: array
 *           items:
 *             type: string
 *           description: List of item IDs in the user's wishlist
 *         isAdmin:
 *           type: boolean
 *           description: Whether the user has admin privileges
 *           default: false
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 */
const userSchema = new mongoose.Schema(
  {
    avatar: {
      default:
        "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
      required: false,
      type: String,
    },
    city: { required: true, trim: true, type: String },
    email: { required: true, trim: true, type: String, unique: true },
    firstname: { required: true, trim: true, type: String },
    housenumber: { required: true, trim: true, type: String },
    lastname: { required: true, trim: true, type: String },
    password: { required: true, trim: true, type: String },
    street: { required: true, trim: true, type: String },
    telephone: { required: true, trim: true, type: String },
    wishList: {
      default: [],
      ref: "Item",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    zipcode: { required: true, trim: true, type: String },
    isAdmin: { default: false, type: Boolean },
    isVerified: { default: false, type: Boolean },
    verificationToken: { type: String },
    resetToken: { type: String },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
