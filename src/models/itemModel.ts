import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema(
  {
    category: {
      enum: [
        "medicine",
        "berries",
        "food",
        "pokéballs",
        "evolution",
        "vitamins",
        "tm/hm",
        "mega stones",
      ],
      required: true,
      trim: true,
      type: String,
    },
    description: { required: true, trim: true, type: String },
    name: { required: true, trim: true, type: String },
    photoUrl: { required: true, trim: true, type: String },
    price: { required: true, trim: true, type: Number },
    tags: {
      default: [],
      ref: "Tag",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
  },
  {
    timestamps: true,
  },
);

export const Items = mongoose.model("Items", itemsSchema);
