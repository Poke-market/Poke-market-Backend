import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    housenumber: { type: String, required: true, trim: true },
    zipcode: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Users = mongoose.model("Items", usersSchema);
