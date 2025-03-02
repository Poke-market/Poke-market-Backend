import mongoose from "mongoose";
import "dotenv/config";

import { MONGO_URI } from "../config/env";
import { Tag } from "../models/tagModel";
import { pokéTags } from "./dataTags";

const seedTags = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Tag.deleteMany();
    await Tag.insertMany(pokéTags);
    console.log("Seeding tags completed successfully! 🌱");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

await seedTags();
