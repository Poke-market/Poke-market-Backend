import mongoose from "mongoose";
import { z } from "zod";
import { NotFoundError, BadRequestError, ValidationError } from "../errors";
import { Tag } from "../models/tagModel";

// Define the input schemas
export const CreateTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name is required"),
});

export const UpdateTagSchema = CreateTagSchema;

// Infer types from schemas
export type CreateTagParams = z.infer<typeof CreateTagSchema>;
export type UpdateTagParams = z.infer<typeof UpdateTagSchema>;

// Tag service functions
export async function getTags() {
  return Tag.find();
}

export async function addTag(name: string) {
  const tagExists = await Tag.countDocuments({ name });
  if (tagExists) {
    throw new BadRequestError(`Tag with name '${name}' already exists`);
  }

  const tag = await Tag.create({ name });
  return tag;
}

export async function deleteTag(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "Tag ID is not valid by Mongoose standards",
    );
  }

  const tag = await Tag.findByIdAndDelete(id);
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  return tag;
}

export async function updateTag(id: string, name: string) {
  // Validate ID
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "Tag ID is not valid by Mongoose standards",
    );
  }

  // Check if tag with new name already exists (and is not the current tag)
  const tagExists = await Tag.countDocuments({ name, _id: { $ne: id } });
  if (tagExists) {
    throw new BadRequestError(`Tag with name '${name}' already exists`);
  }

  const updatedTag = await Tag.findByIdAndUpdate(id, { name }, { new: true });

  if (!updatedTag) {
    throw new NotFoundError("Tag not found");
  }

  return updatedTag;
}

export async function getTagByName(name: string) {
  const tag = await Tag.findOne({ name });
  if (!tag) {
    throw new NotFoundError(`Tag with name '${name}' not found`);
  }

  return tag;
}

export async function getTagById(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "Tag ID is not valid by Mongoose standards",
    );
  }

  const tag = await Tag.findById(id);
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  return tag;
}
