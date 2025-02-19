import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema(
  {
    name: { required: true, trim: true, type: String },
  },
  {
    timestamps: true,
  }
);

export const Tags = mongoose.model("Items", tagsSchema);
