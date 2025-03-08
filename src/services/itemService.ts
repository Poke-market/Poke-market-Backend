import { type FilterQuery } from "mongoose";
import { z } from "zod";
import { NotFoundError } from "../errors";
import { Item, flattenItemTags } from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { RawQuery } from "../types/query";
import { SplitFunc, splitOnComma, splitOnSpace } from "../utils/split";
import { pipe } from "../utils/pipe";

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
    .enum(["asc", "desc", "ascending", "descending", "1", "-1"])
    .optional(),
});

// Infer types from schemas (after Zod parsing)
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type FilterParams = z.infer<typeof FilterParamsSchema>;
export type SortParams = z.infer<typeof SortParamsSchema>;

const stringToRegexArray = (splitFunc: SplitFunc) =>
  pipe(
    splitFunc,
    (x) => x.filter(Boolean),
    (x) => x.map((s) => new RegExp(s, "i")),
    (x) => (x.length > 0 ? x : undefined),
  );

export async function buildItemsFilter(
  params: FilterParams,
): Promise<FilterQuery<typeof Item>> {
  const { search, cat, tag } = FilterParamsSchema.parse(params);
  const andConditions: FilterQuery<typeof Item>[] = [];

  // Handle category filtering
  if (cat) {
    const catFilter = stringToRegexArray(splitOnComma)(cat)?.map((c) => ({
      category: c,
    }));
    if (catFilter) andConditions.push({ $or: catFilter });
  }

  // Handle tag filtering
  if (tag) {
    const tagRegexes = stringToRegexArray(splitOnComma)(tag) ?? [];
    const tagIds = [];
    for (const tagRegex of tagRegexes) {
      const matchingTags = await Tag.find({ name: tagRegex }).select("_id");
      tagIds.push(...matchingTags.map((tag) => tag._id));
    }

    if (tagIds.length > 0) andConditions.push({ tags: { $in: tagIds } });
  }

  // Handle search parameter
  if (search) {
    const searchRegexes = stringToRegexArray(splitOnSpace)(search) ?? [];
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

export function buildItemsSorter(params: SortParams): {
  mongoSorter: Record<string, 1 | -1>;
  memorySorter?: <T extends InstanceType<typeof Item>>(items: T[]) => void;
} {
  const { sort, order } = SortParamsSchema.transform(({ sort, order }) => ({
    sort,
    order:
      order && ["desc", "descending", "-1"].includes(order)
        ? (-1 as const)
        : (1 as const),
  })).parse(params);

  if (!sort) return { mongoSorter: {} };
  const sorter = { mongoSorter: { [sort]: order } };
  return sort === "price"
    ? {
        ...sorter,
        memorySorter: (items) => {
          items.sort((a, b) => {
            // @ts-expect-error discountedPrice is a virtual property
            const aValue = a.discount.discountedPrice as number;
            // @ts-expect-error discountedPrice is a virtual property
            const bValue = b.discount.discountedPrice as number;
            return (aValue - bValue) * order;
          });
        },
      }
    : sorter;
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
