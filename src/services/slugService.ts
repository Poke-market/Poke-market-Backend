import { NotFoundError } from "../errors";
import { Item, flattenItemTags } from "../models/itemModel";
import { slugifyLowercase } from "../utils/slugify";

/**
 * Gets an item by its slug with fuzzy matching capabilities
 */
export async function getItemBySlug(slug: string) {
  console.log(`Looking for item with slug: ${slug}`);

  // Normalize the slug to lowercase
  const normalizedSlug = slug.toLowerCase();

  // First try a direct lookup by slug
  let item = await Item.findOne({ slug: normalizedSlug }).populate("tags");
  console.log(`Direct slug search result: ${item ? "Found" : "Not found"}`);

  // If not found directly, try to find by comparing slugified names
  if (!item) {
    console.log("Attempting to find by comparing slugified names");
    // Get all items for comparison
    const allItems = await Item.find().populate("tags");
    console.log(`Found ${allItems.length} total items to check`);

    // Generate slug variations to handle common typos and formatting differences
    const slugVariations = [
      normalizedSlug, // Original slug but lowercase
      normalizedSlug.replace(/-/g, ""), // Remove all hyphens
      normalizedSlug.replace(/\s+/g, "").replace(/é/g, "e"), // Remove all white space and replace é with e
    ];

    // Look for an item that matches any of the slug variations
    const matchedItem = allItems.find((i) => {
      // Convert item name to a standardized slug format (lowercase, hyphenated)
      const itemSlug = slugifyLowercase(i.name);

      // Check if any variation matches
      return slugVariations.some(
        (variation) =>
          itemSlug === variation ||
          // Remove hyphens for additional matching
          itemSlug.replace(/-/g, "") === variation,
      );
    });

    if (matchedItem) {
      console.log(`Found match by name: ${matchedItem.name}`);
      item = matchedItem;
    }
  }

  // If no item was found with any of our methods, throw an error
  if (!item) {
    console.log("Item not found with the given slug");
    throw new NotFoundError(`Item with slug '${slug}' not found`, {
      logging: true,
    });
  }

  // Return the item with flattened tags
  return flattenItemTags(item.toObject());
}
