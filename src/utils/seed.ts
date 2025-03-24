import mongoose from "mongoose";
import "dotenv/config";

import { MONGO_URI } from "../config/env";
import { Item } from "../models/itemModel";
import { Tag } from "../models/tagModel";
import { pokéitems } from "./data";
import { slugifyLowercase } from "./slugify";

const seedItems = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Item.deleteMany();
    const itemsToInsert = await Promise.all(
      pokéitems.map(async (item) => {
        const tagIds = await Promise.all(
          item.tags?.map(async (tagName: string) => {
            const tagDoc = await Tag.findOne({ name: tagName });
            if (!tagDoc) {
              throw new Error(
                `Tag "${tagName}" does not exist in the database.`,
              );
            }
            return tagDoc._id;
          }) ?? [],
        );

        return { ...item, tags: tagIds, slug: slugifyLowercase(item.name) };
      }),
    );

    await Item.insertMany(itemsToInsert);
    console.log("Seeding items completed successfully! 🌱");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

await seedItems();
//
