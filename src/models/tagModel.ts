import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     Tag:
 *       type: string
 *       description: A tag associated with an item
 *       enum: [throwable, in-battle, catching, healing, open-world, holdable]
 *       example: healing
 */
export const tags = [
  "throwable",
  "in-battle",
  "catching",
  "healing",
  "open-world",
  "holdable",
] as const;

export type ItemTag = (typeof tags)[number];

const tagSchema = new mongoose.Schema(
  {
    name: { required: true, trim: true, type: String },
  },
  {
    timestamps: true,
  },
);

export const Tag = mongoose.model("Tag", tagSchema);
