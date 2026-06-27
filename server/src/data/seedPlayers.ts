import mongoose from "mongoose";
import dotenv from "dotenv";
import { Player } from "../models/Player";
import { IPL_PLAYERS } from "./players";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ipl-stat-battle");
    console.log("Connected to MongoDB");

    await Player.deleteMany({});
    console.log("Cleared existing players");

    const players = await Player.insertMany(IPL_PLAYERS);
    console.log(`Seeded ${players.length} IPL players`);

    await mongoose.disconnect();
    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
