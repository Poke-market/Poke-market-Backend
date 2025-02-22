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
    tags: {
      type: [String],
    },
    // {
    //   default: [],
    //   ref: "Tag",
    //   required: true,
    //   type: [mongoose.Types.ObjectId],
    // },
  },
  {
    timestamps: true,
  },
);

export const Item = mongoose.model("Item", itemSchema);
