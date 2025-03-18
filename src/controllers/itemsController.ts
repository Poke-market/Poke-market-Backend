import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
// import { Error as MongooseError } from "mongoose";

import { NotFoundError, ValidationError } from "../errors";
import {
  categories,
  flattenItemTags,
  Item,
  discountTypes,
} from "../models/itemModel";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { Tag } from "../models/tagModel";
import {
  getItems as getItemsService,
  deleteItem as deleteItemService,
} from "../services/itemService";

// const { ValidationError } = MongooseError;

export const getItems = async (req: Request, res: Response) => {
  const getPageLink = makePageLinkBuilder(req);
  const result = await getItemsService(req.query, getPageLink);

  res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );

  const item = await Item.findById(id).populate("tags");
  if (!item) throw new NotFoundError("No item found");

  res.status(201).json({
    data: { item: flattenItemTags(item.toObject()) },
    status: "success",
  });
};

export const addItem = async (req: Request, res: Response) => {
  const {
    category,
    description,
    name,
    photoUrl,
    price,
    tags,
    isNewItem,
    discount,
  } = z
    .object({
      category: z.string(),
      description: z.string(),
      name: z.string(),
      photoUrl: z.string().url(),
      price: z.number(),
      tags: z.string().array(),
      isNewItem: z.boolean().optional(),
      discount: z
        .object({
          amount: z.number().optional(),
          type: z.enum(discountTypes).optional(),
        })
        .optional(),
    })
    .parse(req.body);

  // Check if category matches the allowed categories
  if (!categories.includes(category)) {
    throw new ValidationError(
      "id",
      `Category is not valid please choose between: ${categories.join(", ")}`,
    );
  }

  // Convert tag names into their corresponding ObjectIds:
  const tagsObjectIds = await Promise.all(
    tags.map(async (tagName: string) => {
      const tagDoc = await Tag.findOne({ name: tagName });
      if (!tagDoc) {
        throw new ValidationError(
          "tag",
          `Tag '${tagName}' does not exist in the database.`,
        );
      }
      return tagDoc._id;
    }),
  );
  // Check if name is unique
  const existingItem = await Item.findOne({ name });
  if (existingItem) {
    throw new ValidationError(
      "name",
      `Item with name '${name}' already exists`,
    );
  }

  const item = await Item.create({
    category,
    description,
    name,
    photoUrl,
    price,
    tags: tagsObjectIds,
    isNewItem,
    discount,
  }).then((item) => item.populate("tags"));

  res.status(201).json({
    data: { item: flattenItemTags(item.toObject()) },
    status: "success",
  });
};

export const updateItem = async (req: Request, res: Response) => {
  // Item needs to be updated by the new data even though not everything was changed or given as data so more like a patch
  const { id } = req.params;

  const {
    category,
    description,
    name,
    photoUrl,
    price,
    tags: _tags,
    isNewItem,
    discount,
  } = z
    .object({
      category: z.string().optional(),
      description: z.string().optional(),
      name: z.string().optional(),
      photoUrl: z.string().url().optional(),
      price: z.number().optional(),
      tags: z.string().array().optional(),
      isNewItem: z.boolean().optional(),
      discount: z
        .object({
          amount: z.number().optional(),
          type: z.enum(discountTypes).optional(),
        })
        .optional(),
    })
    .parse(req.body);

  // Convert tag names into their corresponding ObjectIds:
  let tags;
  if (_tags)
    tags = await Promise.all(
      _tags.map(async (tagName) => {
        const tagDoc = await Tag.findOne({ name: tagName });
        if (!tagDoc) {
          throw new ValidationError(
            "tag",
            `Tag '${tagName}' does not exist in the database.`,
          );
        }
        return tagDoc._id;
      }),
    );

  const item = await Item.findByIdAndUpdate(
    id,
    {
      category,
      description,
      name,
      photoUrl,
      price,
      tags,
      isNewItem,
      discount,
    },
    { new: true },
  ).populate("tags", "name _id");

  if (!item) throw new NotFoundError("Item not found");

  res.status(201).json({
    data: { item: flattenItemTags(item.toObject()) },
    status: "success",
  });
};

export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteItemService(id);

  // Return a properly formatted JSON response
  res.status(200).json({
    status: "success",
    message: "Item successfully deleted",
    data: result.data,
  });
};

export const getItemByName = async (req: Request, res: Response) => {
  const { name } = req.body as Record<string, string>;
  const item = await Item.findOne({ name }).populate("tags");
  if (!item) throw new NotFoundError("Item not found");
  res.status(200).json({
    data: { item: flattenItemTags(item.toObject()) },
    status: "success",
  });
};

export const getItemsByNameQuerry = async (req: Request, res: Response) => {
  const { name } = req.params as Record<string, string>;
  const item = await Item.findOne({ name }).populate("tags");
  if (!item) throw new NotFoundError("Item not found");
  res.status(200).json({
    data: { item: flattenItemTags(item.toObject()) },
    status: "success",
  });
};

export const getItemsByCategory = async (req: Request, res: Response) => {
  const { category } = req.body as Record<string, string>;
  const items = await Item.find({ category }).populate("tags");
  if (items.length === 0) throw new NotFoundError("Items not found");
  res.status(200).json({
    data: { items: items.map((item) => flattenItemTags(item.toObject())) },
    status: "success",
  });
};
export const getItemsByCategoryQuerry = async (req: Request, res: Response) => {
  const { category } = req.params as Record<string, string>;
  const items = await Item.find({ category }).populate("tags");
  //if the array length is 0 return a nout found error
  if (items.length === 0)
    throw new NotFoundError(
      "Category is not found please choose between: medicine, berries, food, pokéballs, evolution, vitamins, tm/hm and mega stones",
      { statusCode: 404 },
    );
  res.status(200).json({
    data: { item: items.map((item) => flattenItemTags(item.toObject())) },
    status: "success",
  });
};
