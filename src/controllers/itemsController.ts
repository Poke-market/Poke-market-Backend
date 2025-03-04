import { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
// import { Error as MongooseError } from "mongoose";

import { BadRequestError, NotFoundError, ValidationError } from "../errors";
import {
  categories,
  flattenItemTags,
  Item,
  discountTypes,
} from "../models/itemModel";
import { makePageLinkBuilder } from "../utils/pageLinkBuilder";
import { Tag } from "../models/tagModel";

// const { ValidationError } = MongooseError;

export const getItems = async (req: Request, res: Response) => {
  const { limit = 16, page = 1 } = req.query as Record<string, string>;
  const skip = (+page - 1) * +limit;

  // Build query based on search parameters
  let query = {};

  // search parameters can be a string or an array of strings
  const searchParam = req.query.search;

  if (searchParam) {
    // convert parameter into an array of search terms
    const searchTerms = Array.isArray(searchParam)
      ? searchParam
      : [searchParam];

    if (searchTerms.length > 0) {
      // Create an array of conditions that must ALL be satisfied (AND logic)
      const searchConditions = [];

      for (const term of searchTerms) {
        //lint was being an ass ai fixed it for me like this
        if (term && typeof term === "string" && term.trim()) {
          const searchRegex = new RegExp(term.trim(), "i");

          // Find the tags that match the search data
          const matchingTags = await Tag.find({ name: searchRegex }).select(
            "_id",
          );
          const tagIds = matchingTags.map((tag) => tag._id);

          // Add a condition for this search term (item name OR tag OR category matches)
          searchConditions.push({
            $or: [
              { name: searchRegex }, // Match by item name
              { tags: { $in: tagIds } }, // Match by tag
              { category: searchRegex }, // Match by category
            ],
          });
        }
      }

      // Apply all search conditions (AND logic between different search terms)
      if (searchConditions.length > 0) {
        query = { $and: searchConditions };
      }
    }
  }

  // Get total count of items matching the query
  const itemCount = await Item.countDocuments(query);
  if (itemCount === 0) throw new NotFoundError("No items found");

  if (+page < 1 || (+page > 1 && skip >= itemCount))
    throw new NotFoundError("Page not found");

  // Find items with the query and apply pagination
  const items = await Item.find(query)
    .limit(+limit)
    .skip(skip)
    .populate("tags");

  const totalPages = Math.ceil(itemCount / +limit);
  const getPageLink = makePageLinkBuilder(req);
  res.status(200).json({
    status: "success",
    data: {
      info: {
        count: itemCount,
        page: +page,
        pages: totalPages,
        prev: +page > 1 ? getPageLink(+page - 1) : null,
        next: +page < totalPages ? getPageLink(+page + 1) : null,
        first: +page > 1 ? getPageLink(1) : null,
        last: +page < totalPages ? getPageLink(totalPages) : null,
      },
      items: items.map((item) => flattenItemTags(item.toObject())),
    },
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
  if (!mongoose.isValidObjectId(id))
    throw new BadRequestError("Item id is not valid id by Mongoose standards");

  const item = await Item.findByIdAndDelete(id);
  if (!item) throw new NotFoundError("Item not found");

  res.status(200).json(item);
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
