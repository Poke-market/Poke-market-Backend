import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
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
    },
    tags: {
      type: [mongoose.Types.ObjectId],
      ref: "Tag",
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Items = mongoose.model("Items", itemsSchema);
