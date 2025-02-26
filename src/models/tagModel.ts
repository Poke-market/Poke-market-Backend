import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: { required: true, trim: true, type: String },
  },
  {
    timestamps: true,
  },
);

export const Tag = mongoose.model("Tag", tagSchema);
