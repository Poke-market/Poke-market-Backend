import { type FilterQuery, type SortOrder } from "mongoose";
import { z } from "zod";
import { NotFoundError } from "../errors";
import { Item, flattenItemTags } from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { RawQuery } from "../types/query";
import { splitOnComma, splitOnSpace } from "../utils/split";
import {
  buildNestedPropSorter,
  NestedPropSorter,
} from "../utils/nestedPropsSorter";

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

export async function buildItemsFilter(
  params: FilterParams,
): Promise<FilterQuery<typeof Item>> {
  const { search, cat, tag } = FilterParamsSchema.parse(params);
  const andConditions: FilterQuery<typeof Item>[] = [];

  // Handle category filtering
  if (cat) {
    const catFilter = splitOnComma(cat).map((c) => ({
      category: new RegExp(c, "i"),
    }));
    if (catFilter.length > 0) andConditions.push({ $or: catFilter });
  }

  // Handle tag filtering
  if (tag) {
    const tagRegexes = splitOnComma(tag).map((t) => new RegExp(t, "i"));
    const tagIds = [];
    for (const tagRegex of tagRegexes) {
      const matchingTags = await Tag.find({ name: tagRegex }).select("_id");
      tagIds.push(...matchingTags.map((tag) => tag._id));
    }

    if (tagIds.length > 0) andConditions.push({ tags: { $in: tagIds } });
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
    if (searchConditions.length > 0) andConditions.push(...searchConditions);
  }

  return andConditions.length > 0 ? { $and: andConditions } : {};
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

export async function getItems(
  params: RawQuery<PaginationParams & FilterParams & SortParams>,
  getPageLink: (page: number) => string,
) {
  const filter = await buildItemsFilter(params);
  const { mongoSorter, memorySorter } = buildItemsSorter(params);
  const { limit, page } = PaginationParamsSchema.parse(params);
  const itemCount = await Item.countDocuments(filter);
  const totalPages = Math.ceil(itemCount / limit);
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

  return {
    info: {
      count: itemCount,
      page: page,
      pages: totalPages,
      prev: page > 1 ? getPageLink(page - 1) : null,
      next: page < totalPages ? getPageLink(page + 1) : null,
      first: page > 1 ? getPageLink(1) : null,
      last: page < totalPages ? getPageLink(totalPages) : null,
    },
    items: items.map((item) => flattenItemTags(item.toObject())),
  };
}
