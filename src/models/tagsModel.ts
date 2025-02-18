import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    enum: [
      "holdable",
      "in-battle",
      "open-world",
      "consumable",
      "countable",
      "lure-repellent",
      "eatable",
    ],
  },
  {
    timestamps: true,
  }
);

export const Tags = mongoose.model("Items", tagsSchema);
