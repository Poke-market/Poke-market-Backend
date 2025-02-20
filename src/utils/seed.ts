import mongoose from "mongoose";
import "dotenv/config";

import { MONGO_URI } from "../config/env";
import { Item } from "../models/itemModel";
import { pokéitems } from "./data";

const seedItems = async () => {
  try {
    await mongoose.connect(MONGO_URI!);
    await Item.deleteMany();
    await Item.insertMany(pokéitems);
    console.log("Seeding vehicles completed successfully! 🌱");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

await seedItems();
