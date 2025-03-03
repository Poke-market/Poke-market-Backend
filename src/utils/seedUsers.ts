import mongoose from "mongoose";
import "dotenv/config";

import { MONGO_URI } from "../config/env";
import { User } from "../models/userModel";
import { trainers } from "./dataTrainers"; // This should export an array of user objects

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await User.deleteMany(); // Remove existing users
    await User.insertMany(trainers);
    console.log("Seeding trainers completed successfully! 🌱");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

await seedUsers();
