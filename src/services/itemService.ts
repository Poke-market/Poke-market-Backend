import { type FilterQuery, type SortOrder } from "mongoose";
import mongoose from "mongoose";
import { z } from "zod";
import { NotFoundError, BadRequestError } from "../errors";
import {
  Item,
  flattenItemTags,
  categories,
  Category,
} from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { RawQuery } from "../types/query";
import { splitOnComma, splitOnSpace } from "../utils/split";
import {
  buildNestedPropSorter,
  NestedPropSorter,
} from "../utils/nestedPropsSorter";
import { generatePaginationInfo } from "../utils/paginationHelper";

// Define the input schemas
export const PaginationParamsSchema = z.object({
  limit: z.coerce.number().min(1).default(16),
  page: z.coerce.number().min(1).default(1),
});

export const FilterParamsSchema = z.object({
  search: z.string().trim().optional(),
  cat: z.string().trim().optional(),
  tag: z.string().trim().optional(),
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

// Infer types from schemas (after Zod parsing)
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;
export type SortParams = z.infer<typeof SortParamsSchema>;

export async function buildItemsFilter(params: FilterParams) {
  const { search, cat, tag } = FilterParamsSchema.parse(params);
  const catFilter: FilterQuery<typeof Item>[] = [];
  const tagFilter: FilterQuery<typeof Item>[] = [];
  const searchFilter: FilterQuery<typeof Item>[] = [];

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

  const combinedFilter = [...catFilter, ...tagFilter, ...searchFilter];
  const filterWithoutCats = [...tagFilter, ...searchFilter];

  return {
    filter: combinedFilter.length > 0 ? { $and: combinedFilter } : {},
    filterWithoutCats:
      filterWithoutCats.length > 0 ? { $and: filterWithoutCats } : {},
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
        memorySorter: buildNestedPropSorter(
          // @ts-expect-error discountedPrice is a virtual property
          (item) => item.discount.discountedPrice as number,
          order,
        ),
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
  const { filter, filterWithoutCats } = await buildItemsFilter(params);
  const { mongoSorter, memorySorter } = buildItemsSorter(params);
  const { limit, page } = PaginationParamsSchema.parse(params);
  const itemCount = await Item.countDocuments(filter);
  const skip = (page - 1) * limit;

  if (page > 1 && skip >= itemCount) throw new NotFoundError("Page not found");

  const items =
    itemCount > 0
      ? await Item.find(filter)
          .collation({ locale: "en", numericOrdering: true })
          .limit(limit)
          .skip(skip)
          .sort(mongoSorter)
          .populate("tags")
      : [];

  if (memorySorter) {
    memorySorter(items);
  }

  // Generate base pagination info
  const paginationInfo = generatePaginationInfo(
    itemCount,
    page,
    limit,
    getPageLink,
  );

  return {
    info: {
      ...paginationInfo,
      categorieCount: await countCategories(filterWithoutCats),
    },
    items: items.map((item) => flattenItemTags(item.toObject())),
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
