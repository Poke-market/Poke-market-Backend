import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
// import { Error as MongooseError } from "mongoose";

import { BadRequestError, NotFoundError, ValidationError } from "../errors";
import { categories, Item } from "../models/itemModel";
import { Tag } from "../models/tagModel";

// const { ValidationError } = MongooseError;

export const getItems = async (req: Request, res: Response) => {
  try {
    // Populate the "tags" field to include the "name" property from the Tag model
    const items = await Item.find().populate("tags", "name _id");
    res.status(201).json({
      data: { items: items },
      status: "success",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Something went wrong" });
    }
  }
};

export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );

  const item = await Item.findById(id);
  res.status(201).json({
    data: { item: item },
    status: "success",
  });
};

export const addItem = async (req: Request, res: Response) => {
  const { category, description, name, photoUrl, price, tags } = z
    .object({
      category: z.string(),
      description: z.string(),
      name: z.string(),
      photoUrl: z.string(),
      price: z.number(),
      tags: z.string().array(),
    })
    .parse(req.body);

  // Check if category matches the allowed categories
  if (!categories.includes(category)) {
    throw new BadRequestError(
      `Category is not valid please choose between: ${categories.join(", ")}`,
      { statusCode: 422 },
    );
  }

  // Convert tag names into their corresponding ObjectIds:
  const tagsObjectIds = await Promise.all(
    tags.map(async (tagName: string) => {
      let tagDoc = await Tag.findOne({ name: tagName });
      if (!tagDoc) {
        tagDoc = await Tag.create({ name: tagName });
      }
      return tagDoc._id;
    }),
  );

  const item = await Item.create({
    category,
    description,
    name,
    photoUrl,
    price,
    tags: tagsObjectIds,
  });

  res.status(201).json({
    data: { item },
    status: "success",
  });
};

export const updateItem = async (req: Request, res: Response) => {
  // Item needs to be updated by the new data even though not everything was changed or given as data so more like a patch
  const { id } = req.params;

  const { category, description, name, photoUrl, price, tags } =
    req.body as Record<string, string>;
  const item = await Item.findByIdAndUpdate(
    id,
    {
      category,
      description,
      name,
      photoUrl,
      price,
      tags,
    },
    { new: true },
  ).populate("tags", "name _id");
  res.status(201).json({
    data: { item: item },
    status: "success",
  });
};

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    throw new BadRequestError("Item id is not valid id by Mongoose standards");

  const item = await Item.findByIdAndDelete(id);
  if (!item) throw new NotFoundError("Item not found");

  res.status(200).json(item);
};

export const getItemByName = async (req: Request, res: Response) => {
  const { name } = req.body as Record<string, string>;
  const item = await Item.findOne({ name });
  if (!item) throw new NotFoundError("Item not found");
  res.status(200).json({
    data: { item: item },
    status: "success",
  });
};

export const getItemsByNameQuerry = async (req: Request, res: Response) => {
  const { name } = req.params as Record<string, string>;
  const item = await Item.findOne({ name });
  if (!item) throw new NotFoundError("Item not found");
  res.status(200).json({
    data: { item: item },
    status: "success",
  });
};

export const getItemsByCategory = async (req: Request, res: Response) => {
  const { category } = req.body as Record<string, string>;
  const item = await Item.find({ category });
  if (!item) throw new NotFoundError("Item not found");
  res.status(200).json({
    data: { item: item },
    status: "success",
  });
};
export const getItemsByCategoryQuerry = async (req: Request, res: Response) => {
  const { category } = req.params as Record<string, string>;
  const item = await Item.find({ category });
  //if the array length is 0 return a nout found error
  if (item.length === 0)
    throw new NotFoundError(
      "Category is not found please choose between: medicine, berries, food, pokéballs, evolution, vitamins, tm/hm and mega stones",
      { statusCode: 404 },
    );
  res.status(200).json({
    data: { item: item },
    status: "success",
  });
};
