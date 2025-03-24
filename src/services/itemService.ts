import { type FilterQuery, type SortOrder, PipelineStage } from "mongoose";
import mongoose from "mongoose";
import { z } from "zod";
import { NotFoundError, BadRequestError, ValidationError } from "../errors";
import {
  Item,
  flattenItemTags,
  categories,
  Category,
  discountTypes,
} from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { RawQuery } from "../types/query";
import { splitOnComma, splitOnSpace } from "../utils/split";
import {
  buildNestedPropSorter,
  NestedPropSorter,
} from "../utils/nestedPropsSorter";
import { generatePaginationInfo } from "../utils/paginationHelper";
import validator from "validator";

const { isURL } = validator;

// Helper function to create a pipeline stage for calculating effective price (with discounts)
function createEffectivePriceStage(
  outputField = "effectivePrice",
): PipelineStage {
  return {
    $addFields: {
      [outputField]: {
        $round: [
          {
            $cond: {
              if: { $eq: ["$discount.type", "percentage"] },
              then: {
                $subtract: [
                  "$price",
                  {
                    $multiply: [
                      "$price",
                      { $divide: ["$discount.amount", 100] },
                    ],
                  },
                ],
              },
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: [{ $type: "$discount" }, "missing"] },
                      { $ne: [{ $type: "$discount.amount" }, "missing"] },
                      { $ne: ["$discount.amount", 0] },
                    ],
                  },
                  then: { $subtract: ["$price", "$discount.amount"] },
                  else: "$price",
                },
              },
            },
          },
          2,
        ],
      },
    },
  } as PipelineStage;
}

// Helper function to calculate price range using aggregation
async function calculatePriceRange(
  filter: FilterQuery<typeof Item>,
): Promise<PriceRange> {
  const priceRangePipeline: PipelineStage[] = [
    { $match: filter } as PipelineStage,
    createEffectivePriceStage(),
    {
      $group: {
        _id: null,
        min: { $min: "$effectivePrice" },
        max: { $max: "$effectivePrice" },
      },
    } as PipelineStage,
  ];

  const priceRangeResult = await Item.aggregate(priceRangePipeline);

  if (priceRangeResult.length > 0) {
    const result = priceRangeResult[0] as { min: number; max: number };
    return {
      min: Number(result.min.toFixed(2)),
      max: Number(result.max.toFixed(2)),
    };
  }

  return { min: 0, max: 0 };
}

// Define the input schemas
export const PaginationParamsSchema = z.object({
  limit: z.coerce.number().min(1).default(16),
  page: z.coerce.number().min(1).default(1),
});

export const FilterParamsSchema = z.object({
  search: z.string().trim().optional(),
  cat: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minDiscountedPrice: z.coerce.number().optional(),
  maxDiscountedPrice: z.coerce.number().optional(),
});

export const SortParamsSchema = z.object({
  sort: z.enum(["name", "price"]).optional(),
  order: z
    .union([
      z.enum(["asc", "desc", "ascending", "descending"]),
      z.literal(1),
      z.literal(-1),
    ])
    .default("asc"),
});

export const CreateItemSchema = z.object({
  category: z.string(),
  description: z.string(),
  name: z.string(),
  photoUrl: z.string().refine(isURL, { message: "Invalid URL" }),
  price: z.number(),
  tags: z.string().array(),
  isNewItem: z.boolean().optional(),
  extraPhotoUrls: z.string().array().optional(),
  discount: z
    .object({
      amount: z.number().optional(),
      type: z.enum(discountTypes).optional(),
    })
    .optional(),
});

export const UpdateItemSchema = CreateItemSchema.partial();

export const GetItemByNameSchema = z.object({
  name: z.string(),
});

// Infer types from schemas (after Zod parsing)
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;
export type SortParams = z.infer<typeof SortParamsSchema>;
export type CreateItemParams = z.infer<typeof CreateItemSchema>;
export type UpdateItemParams = z.infer<typeof UpdateItemSchema>;
export type GetItemByNameParams = z.infer<typeof GetItemByNameSchema>;

export interface PriceRange {
  min: number;
  max: number;
}

export async function buildItemsFilter(params: FilterParams) {
  const {
    search,
    cat,
    tag,
    minPrice,
    maxPrice,
    minDiscountedPrice,
    maxDiscountedPrice,
  } = FilterParamsSchema.parse(params);
  const catFilter: FilterQuery<typeof Item>[] = [];
  const tagFilter: FilterQuery<typeof Item>[] = [];
  const searchFilter: FilterQuery<typeof Item>[] = [];
  const priceFilter: FilterQuery<typeof Item>[] = [];
  const pipeline: PipelineStage[] = [];

  // Handle category filtering
  if (cat) {
    const catMatchers = splitOnComma(cat).map((c) => ({
      category: new RegExp(c, "i"),
    }));
    if (catMatchers.length > 0) catFilter.push({ $or: catMatchers });
  }

  // Handle tag filtering
  if (tag) {
    const tagRegexes = splitOnComma(tag).map((t) => new RegExp(t, "i"));
    const tagIds = [];
    for (const tagRegex of tagRegexes) {
      const matchingTags = await Tag.find({ name: tagRegex }).select("_id");
      tagIds.push(...matchingTags.map((tag) => tag._id));
    }

    if (tagIds.length > 0) tagFilter.push({ tags: { $in: tagIds } });
  }

  // Handle search parameter
  if (search) {
    const searchRegexes = splitOnSpace(search).map((s) => new RegExp(s, "i"));
    const searchConditions = [];
    for (const searchRegex of searchRegexes) {
      const matchingTags = await Tag.find({ name: searchRegex }).select("_id");
      const tagIds = matchingTags.map((tag) => tag._id);

      searchConditions.push({
        $or: [
          { name: searchRegex },
          { tags: { $in: tagIds } },
          { category: searchRegex },
          { description: searchRegex },
        ],
      });
    }
    if (searchConditions.length > 0) searchFilter.push(...searchConditions);
  }

  // Handle regular price filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: Record<string, number> = {};
    if (minPrice !== undefined) priceCondition.$gte = minPrice;
    if (maxPrice !== undefined) priceCondition.$lte = maxPrice;

    if (Object.keys(priceCondition).length > 0) {
      priceFilter.push({ price: priceCondition });
    }
  }

  // Handle discounted price filtering using MongoDB aggregation
  if (minDiscountedPrice !== undefined || maxDiscountedPrice !== undefined) {
    // Use the helper function to calculate discounted price
    pipeline.push(createEffectivePriceStage("discountedPrice"));

    const discountedPriceCondition: Record<string, number> = {};
    if (minDiscountedPrice !== undefined)
      discountedPriceCondition.$gte = minDiscountedPrice;
    if (maxDiscountedPrice !== undefined)
      discountedPriceCondition.$lte = maxDiscountedPrice;

    if (Object.keys(discountedPriceCondition).length > 0) {
      pipeline.push({
        $match: {
          discountedPrice: discountedPriceCondition,
        },
      } as PipelineStage);
    }
  }

  const combinedFilter = [
    ...catFilter,
    ...tagFilter,
    ...searchFilter,
    ...priceFilter,
  ];
  const filterWithoutCats = [...tagFilter, ...searchFilter, ...priceFilter];

  return {
    filter: combinedFilter.length > 0 ? { $and: combinedFilter } : {},
    filterWithoutCats:
      filterWithoutCats.length > 0 ? { $and: filterWithoutCats } : {},
    pipeline,
  };
}

export function buildItemsSorter(params: RawQuery<SortParams>): {
  mongoSorter: Record<string, SortOrder>; // sort in mongo query
  memorySorter?: NestedPropSorter<InstanceType<typeof Item>>; // sort in js (used for virtual properties)
} {
  const { sort, order } = SortParamsSchema.parse(params);

  switch (sort) {
    case "name":
      return { mongoSorter: { name: order } };
    case "price":
      return {
        mongoSorter: { price: order },
        memorySorter: buildNestedPropSorter((item) => {
          // For items with discount, calculate the discounted price
          if (item.discount?.amount) {
            if (item.discount.type === "percentage") {
              return item.price - item.price * (item.discount.amount / 100);
            } else {
              return item.price - item.discount.amount;
            }
          }
          // For items without discount, return the regular price
          return item.price;
        }, order),
      };
    default:
      return { mongoSorter: {} };
  }
}

async function countCategories(filter: FilterQuery<typeof Item>) {
  // Initialize all categories with zero count
  const categorieCount = Object.fromEntries(
    categories.map((cat) => [cat, 0]),
  ) as Record<Category, number>;

  const categoryAggregation: {
    _id: Category;
    count: number;
  }[] = await Item.aggregate([
    { $match: filter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  // Update counts for categories that have items
  for (const { _id, count } of categoryAggregation) {
    categorieCount[_id] = count;
  }

  return categorieCount;
}

export async function getItems(
  params: RawQuery<PaginationParams & FilterParams & SortParams>,
  getPageLink: (page: number) => string,
) {
  const { filter, filterWithoutCats, pipeline } =
    await buildItemsFilter(params);
  const { mongoSorter, memorySorter } = buildItemsSorter(params);
  const { limit, page } = PaginationParamsSchema.parse(params);

  let itemCount;
  const skip = (page - 1) * limit;
  let items: unknown[] = [];

  // Calculate price range using the helper function
  const priceRange = await calculatePriceRange(filter);

  if (pipeline && pipeline.length > 0) {
    try {
      // Convert string sort orders to numeric for MongoDB aggregation
      const numericSorter: Record<string, 1 | -1> = {};
      for (const [key, value] of Object.entries(mongoSorter)) {
        numericSorter[key] =
          value === "asc" || value === "ascending" || value === 1 ? 1 : -1;
      }

      // Calculate total count with discounted price filtering
      const countPipeline: PipelineStage[] = [
        { $match: filter } as PipelineStage,
        ...pipeline,
        { $count: "total" } as PipelineStage,
      ];

      interface CountResult {
        total: number;
      }
      const countResult = await Item.aggregate(countPipeline);
      itemCount =
        countResult.length > 0
          ? (countResult[0] as CountResult)?.total || 0
          : 0;

      // If page is out of bounds, throw an error
      if (page > 1 && skip >= itemCount)
        throw new NotFoundError("Page not found");

      // Use aggregation pipeline for discounted price filtering
      const aggregationPipeline: PipelineStage[] = [
        { $match: filter } as PipelineStage,
        ...pipeline,
      ];

      // Only add sort stage if we have a valid mongoSorter
      if (Object.keys(numericSorter).length > 0) {
        aggregationPipeline.push({ $sort: numericSorter } as PipelineStage);
      }

      aggregationPipeline.push(
        { $skip: skip } as PipelineStage,
        { $limit: limit } as PipelineStage,
      );

      // Add stage to move discountedPrice into the discount object for consistency
      aggregationPipeline.push({
        $addFields: {
          "discount.discountedPrice": "$discountedPrice",
          "discount.hasDiscount": {
            $and: [
              { $ne: [{ $type: "$discount" }, "missing"] },
              { $ne: [{ $type: "$discount.amount" }, "missing"] },
              { $ne: ["$discount.amount", 0] },
              { $ne: ["$discountedPrice", "$price"] },
            ],
          },
        },
      } as PipelineStage);

      // Remove the top-level discountedPrice field
      aggregationPipeline.push({
        $project: {
          discountedPrice: 0,
        },
      } as PipelineStage);

      // Execute the aggregation pipeline
      const aggregationResult = await Item.aggregate(aggregationPipeline);

      // Populate tags for each item in the aggregation result
      if (aggregationResult.length > 0) {
        // Cast item._id to ObjectId to ensure proper type safety
        const itemIds = aggregationResult
          .map((item) => {
            const typedItem = item as { _id: mongoose.Types.ObjectId };
            if (typedItem._id) {
              return new mongoose.Types.ObjectId(typedItem._id.toString());
            }
            return undefined;
          })
          .filter((id): id is mongoose.Types.ObjectId => id !== undefined);

        const itemsWithTags = await Item.find({
          _id: { $in: itemIds },
        }).populate("tags");

        // Create a lookup map for tags
        const tagMap = new Map();
        itemsWithTags.forEach((item) => {
          tagMap.set(item._id.toString(), item.tags);
        });

        // Add tags to each item in the aggregation result
        items = aggregationResult.map((item) => {
          const typedItem = item as { _id: mongoose.Types.ObjectId };
          if (!typedItem._id) return item as Record<string, unknown>;

          return {
            ...item,
            tags: tagMap.get(typedItem._id.toString()) || [],
          } as Record<string, unknown>;
        });
      } else {
        items = [];
      }
    } catch (error) {
      console.error("Error in aggregation pipeline:", error);
      throw new BadRequestError("Error processing discounted price filter");
    }
  } else {
    // If not using discounted price filtering, use regular find
    itemCount = await Item.countDocuments(filter);
    if (page > 1 && skip >= itemCount)
      throw new NotFoundError("Page not found");

    items =
      itemCount > 0
        ? await Item.find(filter)
            .collation({ locale: "en", numericOrdering: true })
            .limit(limit)
            .skip(skip)
            .sort(mongoSorter)
            .populate("tags")
        : [];

    // Only apply memory sorting for regular mongoose documents, not aggregation results
    if (memorySorter && items.length > 0) {
      memorySorter(items as InstanceType<typeof Item>[]);
    }
  }

  // Generate base pagination info
  const paginationInfo = generatePaginationInfo(
    itemCount,
    page,
    limit,
    getPageLink,
  );

  // Define an interface for items with toObject method
  interface WithToObject {
    toObject: () => Record<string, unknown>;
  }

  // Type guard to check if an item has toObject method
  function hasToObject(item: unknown): item is WithToObject {
    return (
      item !== null &&
      typeof item === "object" &&
      "toObject" in item &&
      typeof (item as WithToObject).toObject === "function"
    );
  }

  return {
    info: {
      ...paginationInfo,
      categorieCount: await countCategories(filterWithoutCats),
      priceRange,
    },
    items: items.map((item) => {
      // Handle both Mongoose documents and aggregation results
      if (hasToObject(item)) {
        return flattenItemTags(item.toObject());
      }
      return flattenItemTags(item as Record<string, unknown>);
    }),
  };
}

export async function deleteItem(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new BadRequestError("Item id is not valid id by Mongoose standards");
  }

  const item = await Item.findByIdAndDelete(id);
  if (!item) throw new NotFoundError("Item not found");

  return {
    status: "success",
    message: "Item successfully deleted",
    data: {
      item: flattenItemTags(item.toObject()),
    },
  };
}

export async function getItemById(id: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );
  }

  const item = await Item.findById(id).populate("tags");
  if (!item) throw new NotFoundError("No item found");

  return {
    item: flattenItemTags(item.toObject()),
  };
}

export async function getItemByName(name: string) {
  const item = await Item.findOne({ name }).populate("tags");
  if (!item) throw new NotFoundError("Item not found");

  return {
    item: flattenItemTags(item.toObject()),
  };
}

export async function addItem(itemData: CreateItemParams) {
  const { category, tags, name, ...otherData } = itemData;

  // Check if category matches the allowed categories
  if (!categories.includes(category)) {
    throw new ValidationError(
      "id",
      `Category is not valid please choose between: ${categories.join(", ")}`,
    );
  }

  // Check if name is unique
  const nameExists = await Item.countDocuments({ name });
  if (nameExists) {
    throw new ValidationError(
      "name",
      `Item with name '${name}' already exists`,
    );
  }

  // Convert tag names into their corresponding ObjectIds
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
    name,
    tags: tagsObjectIds,
    ...otherData,
  }).then((item) => item.populate("tags"));

  return {
    item: flattenItemTags(item.toObject()),
  };
}

export async function updateItem(id: string, itemData: UpdateItemParams) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ValidationError(
      "id",
      "Item id is not valid id by Mongoose standards",
    );
  }

  // Check if name is unique (except for the current item)
  if (itemData.name) {
    const nameExists = await Item.countDocuments({
      name: itemData.name,
      _id: { $ne: id },
    });
    if (nameExists) {
      throw new ValidationError(
        "name",
        `Item with name '${itemData.name}' already exists`,
      );
    }
  }

  const { tags: _tags, ...otherData } = itemData;

  // Convert tag names into their corresponding ObjectIds if provided
  let tags;
  if (_tags) {
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
  }

  const item = await Item.findByIdAndUpdate(
    id,
    {
      ...otherData,
      ...(tags && { tags }),
    },
    { new: true },
  ).populate("tags", "name _id");

  if (!item) throw new NotFoundError("Item not found");

  return {
    item: flattenItemTags(item.toObject()),
  };
}
