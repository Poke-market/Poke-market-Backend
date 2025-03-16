import { Request, Response } from "express";
import { slugifyLowercase } from "../utils/slugify";
import { NotFoundError } from "../errors";
import { Item, flattenItemTags } from "../models/itemModel";

export const getItemBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params as Record<string, string>;
  console.log(`Looking for item with slug: ${slug}`);

  // lowercase the slug
  const normalizedSlug = slug.toLowerCase();

  // check if item exists by slug
  let item = await Item.findOne({ slug: normalizedSlug }).populate("tags");
  console.log(`Direct slug search result: ${item ? "Found" : "Not found"}`);

  // check if item exists by name en slug de naam
  if (!item) {
    console.log("Attempting to find by comparing slugified names");
    // try to find an item by name when it's slugged end matches the slug in the url
    const allItems = await Item.find().populate("tags");
    console.log(`Found ${allItems.length} total items to check`);

    // zoek op typfouten / variaties
    const slugVariations = [
      normalizedSlug, // OG slug but lowercase
      normalizedSlug.replace(/-/g, ""), // Remove all hyphens
      normalizedSlug.replace(/\s+/g, "").replace(/é/g, "e"), // Remove all white space and replace é with e
    ];

    // look for an item that matches any of slug variations
    const matchedItem = allItems.find((i) => {
      // Convert item name to a standardized slug format (lowercase, hyphenated)
      const itemSlug = slugifyLowercase(i.name);

      // check if any lower case matchs
      return slugVariations.some(
        (variation) =>
          itemSlug === variation ||
          // remove them hyphens
          itemSlug.replace(/-/g, "") === variation,
      );
    });

    if (matchedItem) {
      console.log(`Found match by name: ${matchedItem.name}`);
      item = matchedItem;
    }
  }

  if (!item) {
    console.log("Item not found with the given slug");
    throw new NotFoundError(`Item with slug '${slug}' not found`, {
      logging: true,
    });
  }

  res.status(200).json({
    status: "success",
    data: { item: flattenItemTags(item.toObject()) },
  });
};
