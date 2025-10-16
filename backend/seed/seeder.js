import mongoose from "mongoose";
import Room from "../models/Room.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to find the .env file in the parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BLOCKS = ["A", "B", "C"];
const FLOORS = [1, 2, 3, 4];
const ROOMS_PER_FLOOR = 10;
const BEDS_PER_ROOM = 4;

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Seeding");

    await Room.deleteMany({});
    console.log("🗑️  Previous room data deleted.");

    const roomsToCreate = [];

    for (const block of BLOCKS) {
      for (const floor of FLOORS) {
        for (let i = 1; i <= ROOMS_PER_FLOOR; i++) {
          const roomNumber = `${block}${floor}0${i}`;
          const beds = [];
          for (let j = 1; j <= BEDS_PER_ROOM; j++) {
            beds.push({
              bedNumber: `B${j}`,
              isWindowSide: j === 1, // Let's make the first bed always window-side
              occupied: Math.random() < 0.35, // 35% chance a bed is occupied
            });
          }
          roomsToCreate.push({ block, floor, roomNumber, beds });
        }
      }
    }

    await Room.insertMany(roomsToCreate);
    console.log(`🏠 ${roomsToCreate.length} rooms created successfully!`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
  }
};

seedDatabase();