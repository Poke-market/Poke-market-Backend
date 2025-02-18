import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Tags = mongoose.model("Items", tagsSchema);
