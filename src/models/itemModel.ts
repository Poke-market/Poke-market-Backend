import mongoose from "mongoose";
import { slugifyLowercase } from "../utils/slugify";

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: string
 *       enum: [medicine, berries, food, pokéballs, evolution, vitamins, tm/hm, mega stones]
 */
export const categories = [
  "medicine",
  "berries",
  "food",
  "pokéballs",
  "evolution",
  "vitamins",
  "tm/hm",
  "mega stones",
] as const;

export type Category = (typeof categories)[number];
export const discountTypes = ["percentage", "absolute"] as const;

/**
 * @openapi
 * components:
 *   schemas:
 *     Discount:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: The discount amount
 *         type:
 *           type: string
 *           enum: [percentage, absolute]
 *           description: The type of discount
 *         discountedPrice:
 *           type: number
 *           description: The calculated price after discount
 *         hasDiscount:
 *           type: boolean
 *           description: Indicates if the item has an active discount
 */
const discountSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 0,
      required: true,
      set: (v: number) => Math.abs(v),
    },
    type: {
      enum: discountTypes,
      default: "percentage",
      required: true,
      trim: true,
      type: String,
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

discountSchema.virtual("discountedPrice").get(function () {
  let price = (this.$parent() as unknown as { price: number }).price;
  const amount = this.amount;
  switch (this.type) {
    case "percentage":
      price *= 1 - amount / 100;
      break;
    case "absolute":
      price -= amount;
      break;
  }
  return Math.round(price * 100) / 100;
});

discountSchema.virtual("hasDiscount").get(function () {
  const price = (this.$parent() as unknown as { price: number }).price;
  const discountedPrice = (this as unknown as { discountedPrice: number })
    .discountedPrice;
  return price !== discountedPrice;
});

/**
 * @openapi
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - description
 *         - photoUrl
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *           description: The item ID
 *         name:
 *           type: string
 *           description: The name of the item
 *         price:
 *           type: number
 *           description: The base price of the item
 *         description:
 *           type: string
 *           description: Description of the item
 *         photoUrl:
 *           type: string
 *           description: URL to the item's image
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         tags:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Tag'
 *           description: Tags associated with the item
 *         discount:
 *           $ref: '#/components/schemas/Discount'
 *         isNewItem:
 *           type: boolean
 *           description: Indicates if this is a newly added item
 *         slug:
 *           type: string
 *           description: URL-friendly version of the item name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the item was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was last updated
 */
const itemSchema = new mongoose.Schema(
  {
    category: {
      enum: categories,
      required: true,
      trim: true,
      type: String,
    },
    description: { required: true, trim: true, type: String },
    name: { required: true, trim: true, type: String, unique: true },
    photoUrl: { required: true, trim: true, type: String },
    price: { required: true, trim: true, type: Number },
    tags:
      //   type: [String],
      // },
      {
        default: [],
        ref: "Tag",
        required: true,
        type: [mongoose.Types.ObjectId],
      },
    discount: {
      type: discountSchema,
      default: () => ({}),
    },
    isNewItem: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create slug from the name before saving
itemSchema.pre("save", function (next) {
  this.slug = slugifyLowercase(this.name);
  next();
});

// Update slug when name is updated
itemSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as { name?: string; slug?: string };
  if (update?.name) {
    update.slug = slugifyLowercase(update.name);
  }
  next();
});

export const flattenItemTags = <T extends object>(
  item: T,
): Omit<T, "tags"> & { tags: string[] } => ({
  ...item,
  tags: (item as { tags: { name: string }[] }).tags.map((tag) => tag.name),
});

export const Item = mongoose.model("Item", itemSchema);
