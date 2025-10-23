import mongoose from "mongoose";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Fee from "../models/Fee.js";
import Complaint from "../models/Complaint.js"; // (NEW)
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleStudents = [
  {
    name: "Mohith Gowda R.M.",
    admissionNo: "1JB21CS100",
    role: "student",
    password: "123",
    semester: "5th",
    studentPhone: "9876543210",
    parentName: "Mr. Ramesh G.",
    parentPhone: "9876543211",
    address: "123, Main Road, Bangalore"
  },
  {
    name: "Akash B.",
    admissionNo: "1JB21CS005",
    role: "student",
    password: "123",
    semester: "5th",
    studentPhone: "9123456780",
    parentName: "Mr. Suresh K.",
    parentPhone: "9123456781",
    address: "456, 2nd Cross, Mysore"
  },
  {
    name: "Priya S.",
    admissionNo: "1JB21EC050",
    role: "student",
    password: "123",
    semester: "3rd",
    studentPhone: "8765432109",
    parentName: "Mrs. Lakshmi S.",
    parentPhone: "8765432108",
    address: "789, Park Avenue, Mangalore"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for Seeding");

    // Clear old data
    await Room.deleteMany({});
    console.log("🗑️  Previous room data deleted.");
    await User.deleteMany({ role: 'student' });
    console.log("🗑️  Previous student data deleted.");
    await Fee.deleteMany({});
    console.log("🗑️  Previous fee data deleted.");
    await Complaint.deleteMany({}); // (NEW)
    console.log("🗑️  Previous complaint data deleted."); // (NEW)


    // Seed Students
    const createdUsers = await User.insertMany(sampleStudents);
    console.log(`🧑 ${createdUsers.length} students created successfully!`);

    
    // Seed Fees for each student
    const feePromises = createdUsers.map(user => {
      return Fee.create({ student: user._id, amount: 50000, status: "pending" });
    });
    await Promise.all(feePromises);
    console.log(`💸 ${createdUsers.length} pending fee records created.`);

    
    // (NEW) Seed Complaints
    const complaintData = [
      {
        student: createdUsers[0]._id, // Mohith
        category: "Electrical",
        description: "Fan in room A101 is not working.",
        status: "Submitted"
      },
      {
        student: createdUsers[1]._id, // Akash
        category: "Plumbing",
        description: "Shower in B203 bathroom is leaking.",
        status: "Submitted"
      }
    ];
    await Complaint.insertMany(complaintData);
    console.log(`🛠️ ${complaintData.length} sample complaints created.`);


    // Seed Rooms
    const BLOCKS = ["A", "B", "C"];
    const FLOORS = [1, 2, 3, 4];
    const ROOMS_PER_FLOOR = 10;
    const BEDS_PER_ROOM = 4;
    
    const roomsToCreate = [];
    for (const block of BLOCKS) {
      for (const floor of FLOORS) {
        for (let i = 1; i <= ROOMS_PER_FLOOR; i++) {
          const roomNumber = `${block}${floor}0${i}`;
          const beds = [];
          for (let j = 1; j <= BEDS_PER_ROOM; j++) {
            beds.push({
              bedNumber: `B${j}`,
              isWindowSide: j === 1,
              occupied: false,
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