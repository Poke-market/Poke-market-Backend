import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Account = mongoose.model("Items", accountSchema);
