import mongoose from "mongoose";
import Room from "../models/Room.js";
import User from "../models/User.js";
import Fee from "../models/Fee.js";
import Complaint from "../models/Complaint.js"; 
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// === USN GENERATION LOGIC ===
const USN_YEARS = ["21", "22", "23"];
const USN_DEPARTMENTS = ["CS", "IS", "DS", "AI", "EC"];
const MAX_STUDENTS = 25; 
const generatedUsns = new Set();

function generateUniqueUsn(index) {
    let usn;
    // Distribute students across cohorts and departments
    const year = USN_YEARS[Math.floor(index / 9) % USN_YEARS.length]; // Cycle years every 9 students
    const dept = USN_DEPARTMENTS[Math.floor(index / 5) % USN_DEPARTMENTS.length]; // Cycle departments every 5 students
    const serial = String(index + 1).padStart(3, '0'); 
    usn = `1JB${year}${dept}${serial}`;
    generatedUsns.add(usn);
    return usn;
}

// === UPDATED STUDENT LIST ===
// Base data structure for students
const baseStudents = [
  { name: "Mohith Gowda R.M.", semester: "5th", studentPhone: "9876543210", parentName: "Mr. Ramesh G.", parentPhone: "9876543211", address: "123, Main Road, Bangalore" },
  { name: "Akash B.", semester: "5th", studentPhone: "9123456780", parentName: "Mr. Suresh K.", parentPhone: "9123456781", address: "456, 2nd Cross, Mysore" },
  { name: "Priya S.", semester: "3rd", studentPhone: "8765432109", parentName: "Mrs. Lakshmi S.", parentPhone: "8765432108", address: "789, Park Avenue, Mangalore" },
  { name: "Rohan Varma", semester: "5th", studentPhone: "9900112233", parentName: "Mr. Anil Varma", parentPhone: "9900112234", address: "101, SKR Road, Bangalore" },
  { name: "Ananya Reddy", semester: "3rd", studentPhone: "9887766554", parentName: "Mr. Prakash Reddy", parentPhone: "9887766555", address: "202, Infotech Ave, Hyderabad" },
  { name: "Vikram Singh", semester: "7th", studentPhone: "9778899001", parentName: "Mr. Arjun Singh", parentPhone: "9778899002", address: "303, Royal Layout, Delhi" },
  { name: "Sneha Patel", semester: "5th", studentPhone: "9665544332", parentName: "Mr. Kiran Patel", parentPhone: "9665544331", address: "404, Tulip Apartments, Ahmedabad" },
  { name: "Karan Sharma", semester: "3rd", studentPhone: "9554433221", parentName: "Mr. Rajesh Sharma", parentPhone: "9554433220", address: "505, Ganga Vihar, Pune" },
  { name: "Meera Desai", semester: "7th", studentPhone: "9443322110", parentName: "Mrs. Sunita Desai", parentPhone: "9443322111", address: "606, Marina Towers, Mumbai" },
  { name: "Arjun Mehta", semester: "5th", studentPhone: "9332211009", parentName: "Mr. Vijay Mehta", parentPhone: "9332211008", address: "707, Silicon Orchards, Bangalore" },
  { name: "Nidhi Kumar", semester: "3rd", studentPhone: "9221100998", parentName: "Mr. Ashok Kumar", parentPhone: "9221100997", address: "808, Green Meadows, Chennai" },
  { name: "Sameer Jain", semester: "5th", studentPhone: "9110099887", parentName: "Mr. Deepak Jain", parentPhone: "9110099886", address: "909, Lotus Point, Jaipur" },
  { name: "Divya Rao", semester: "7th", studentPhone: "9009988776", parentName: "Mr. Sathish Rao", parentPhone: "9009988775", address: "111, Coastal View, Mangalore" },
  { name: "Harish Nair", semester: "5th", studentPhone: "8998877665", parentName: "Mr. Mohan Nair", parentPhone: "8998877664", address: "222, Lakeview, Kochi" },
  { name: "Pooja Gupta", semester: "3rd", studentPhone: "8887766554", parentName: "Mr. Omprakash Gupta", parentPhone: "8887766553", address: "333, Adarsh Nagar, Bhopal" },
  { name: "Rahul Tiwari", semester: "7th", studentPhone: "8776655443", parentName: "Mr. Alok Tiwari", parentPhone: "8776655442", address: "444, Sangam Vihar, Prayagraj" },
  { name: "Sanjana Iyer", semester: "5th", studentPhone: "8665544332", parentName: "Mr. Venkatesh Iyer", parentPhone: "8665544331", address: "555, Kaveri Layout, Mysore" },
  { name: "Tarun BC", semester: "5th", studentPhone: "8554433221", parentName: "Chandrashekar", parentPhone: "8554433220", address: "666, Jubilee Hills, Karnataka" },
  { name: "Vaishnavi Kulkarni", semester: "7th", studentPhone: "8443322110", parentName: "Mr. Anand Kulkarni", parentPhone: "8443322119", address: "777, Deccan Gymkhana, Pune" },
  { name: "Preetham S", semester: "5th", studentPhone: "8332211009", parentName: "Shashi Kumar", parentPhone: "9731902465", address: "888, Temple Road, Channapatna" },
  { name: "Zoya Khan", semester: "3rd", studentPhone: "8221100998", parentName: "Mr. Irfan Khan", parentPhone: "8221100997", address: "999, Charminar, Hyderabad" },
  { name: "Rakshith S", semester: "5th", studentPhone: "7619638580", parentName: "Mr. Ravi Prasad", parentPhone: "8110099886", address: "100, Patna Main, Channapatna" },
  { name: "Bhargavi N", semester: "7th", studentPhone: "8009988776", parentName: "Mr. Narayanappa", parentPhone: "8009988775", address: "112, Kolar Gold Fields, Kolar" },
  { name: "Aun Rizvi", semester: "5th", studentPhone: "7998877665", parentName: "Dr. K N Qaisar", parentPhone: "7998877664", address: "113, Hassan City, Kashmir" },
  { name: "Deepa Hegde", semester: "5th", studentPhone: "7887766554", parentName: "Mr. Ramakrishna Hegde", parentPhone: "7887766553", address: "114, Sirsi, Uttara Kannada" }
];

// Map base students to final sampleStudents with dynamically generated USNs
const sampleStudents = baseStudents.map((student, index) => ({
  ...student,
  usn: generateUniqueUsn(index),
  role: "student",
  password: "123",
}));


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
    await Complaint.deleteMany({});
    console.log("🗑️  Previous complaint data deleted.");


    // Seed Students
    const createdUsers = await User.insertMany(sampleStudents);
    console.log(`🧑 ${createdUsers.length} students created successfully!`);

    
    // Seed Fees for each student
    const feePromises = createdUsers.map(user => {
        // Make some fees 'paid' and others 'pending'
        const isPaid = Math.random() < 0.2; // ~20% of students have paid
        return Fee.create({ 
            student: user._id, 
            amount: 50000, 
            status: isPaid ? "paid" : "pending",
            paymentDate: isPaid ? new Date() : null
        });
    });
    await Promise.all(feePromises);
    console.log(`💸 ${createdUsers.length} fee records created.`);

    
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
      },
      {
        student: createdUsers[4]._id, // Ananya Reddy
        category: "Wi-Fi",
        description: "Internet is very slow on the 3rd floor.",
        status: "In Progress"
      },
      {
        student: createdUsers[7]._id, // Karan Sharma
        category: "Mess",
        description: "Food quality was bad today.",
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