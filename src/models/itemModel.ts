import mongoose from "mongoose";

export const categories = [
  "medicine",
  "berries",
  "food",
  "pokéballs",
  "evolution",
  "vitamins",
  "tm/hm",
  "mega stones",
];

export const discountTypes = ["percentage", "absolute"] as const;

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
  },
  {
    timestamps: true,
  },
);

export const flattenItemTags = (item: object) => ({
  ...item,
  tags: (item as { tags: { name: string }[] }).tags.map((tag) => tag.name),
});

export const Item = mongoose.model("Item", itemSchema);
