import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    done: {
      default: false,
      type: Boolean,
    },
    task: {
      required: true,
      trim: true,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Todo = mongoose.model("Todo", todoSchema);
