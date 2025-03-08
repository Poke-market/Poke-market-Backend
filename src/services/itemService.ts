import mongoose from "mongoose";
import { z } from "zod";
import { NotFoundError } from "../errors";
import { Item, flattenItemTags } from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { RawQuery } from "../types/query";

// Define the input schemas
export const PaginationParamsSchema = z.object({
  limit: z.coerce.number().min(1).default(16),
  page: z.coerce.number().min(1).default(1),
});

export const FilterParamsSchema = z.object({
  search: z.union([z.string(), z.array(z.string())]).optional(),
  cat: z.string().optional(),
  tag: z.string().optional(),
});

// Infer types from schemas (after Zod parsing)
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;

export async function buildItemsFilter(
  params: FilterParams,
): Promise<mongoose.FilterQuery<typeof Item>> {
  const { search, cat, tag } = FilterParamsSchema.parse(params);
  const andConditions: mongoose.FilterQuery<typeof Item>[] = [];

  // Handle category filtering
  if (cat) {
    const categoryTerms = cat.split(",").filter(Boolean);
    if (categoryTerms.length > 0) {
      const categoryConditions = categoryTerms.map((term) => ({
        category: new RegExp(term.trim(), "i"),
      }));

      if (categoryConditions.length > 1) {
        andConditions.push({ $or: categoryConditions });
      } else {
        andConditions.push(categoryConditions[0]);
      }
    }
  }

  // Handle tag filtering
  if (tag) {
    const tagTerms = tag.split(",").filter(Boolean);
    if (tagTerms.length > 0) {
      const tagIds = [];
      for (const term of tagTerms) {
        const tagRegex = new RegExp(term.trim(), "i");
        const matchingTags = await Tag.find({ name: tagRegex }).select("_id");
        tagIds.push(...matchingTags.map((tag) => tag._id));
      }

      if (tagIds.length === 0) {
        throw new NotFoundError(
          `No items found with the specified tag(s): ${tag}`,
        );
      }

      andConditions.push({ tags: { $in: tagIds } });
    }
  }

  // Handle search parameter
  if (search) {
    const searchTerms = Array.isArray(search) ? search : [search];

    if (searchTerms.length > 0) {
      const searchConditions = [];

      for (const term of searchTerms) {
        if (term && typeof term === "string" && term.trim()) {
          const searchRegex = new RegExp(term.trim(), "i");
          const matchingTags = await Tag.find({ name: searchRegex }).select(
            "_id",
          );
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
      }

      if (searchConditions.length > 0) {
        andConditions.push(...searchConditions);
      }
    }
  }

  return andConditions.length > 0 ? { $and: andConditions } : {};
}

export async function getItems(
  params: RawQuery<PaginationParams & FilterParams>,
  getPageLink: (page: number) => string,
) {
  const filter = await buildItemsFilter(params);
  const { limit, page } = PaginationParamsSchema.parse(params);
  const itemCount = await Item.countDocuments(filter);
  const totalPages = Math.ceil(itemCount / limit);
  const skip = (page - 1) * limit;

  if (page > 1 && skip >= itemCount) throw new NotFoundError("Page not found");

  const items =
    itemCount > 0
      ? await Item.find(filter).limit(limit).skip(skip).populate("tags")
      : [];

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
