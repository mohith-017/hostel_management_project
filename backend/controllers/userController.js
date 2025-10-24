import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Room from "../models/Room.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user with detailed info
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const {
      name, admissionNo, role, password,
      semester, studentPhone, parentName, parentPhone, address, // Student fields
      post // Admin fields
    } = req.body;

    // Basic validation
    if (!name || !admissionNo || !role || !password) {
      return res.status(400).json({ error: "Please fill name, ID, role, and password." });
    }

    const userExists = await User.findOne({ admissionNo });
    if (userExists) {
      return res.status(400).json({ error: "User with this ID already exists!" });
    }

    // Prepare userData object based on role
    const userData = { name, admissionNo, role, password };

    if (role === 'student') {
        // Validate student-specific required fields
        if (!semester || !studentPhone || !parentName || !parentPhone || !address) {
             return res.status(400).json({ error: "Please fill all student details (Semester, Phone, Parent Name, Parent Phone, Address)." });
        }
      userData.semester = semester;
      userData.studentPhone = studentPhone;
      userData.parentName = parentName;
      userData.parentPhone = parentPhone;
      userData.address = address;
    } else if (role === 'admin') {
        // Validate admin-specific required fields
        if (!post) {
            return res.status(400).json({ error: "Please provide the admin post." });
        }
      userData.post = post;
    } else {
        return res.status(400).json({ error: "Invalid role specified." });
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      // Avoid sending sensitive info back, just a success message
      res.status(201).json({ message: "Registration successful! Please login." });
    } else {
      // This case might indicate a different issue if create didn't throw an error but returned falsy
      res.status(400).json({ error: "Invalid user data or failed to create user." });
    }
  } catch (error) {
    // Catch potential errors from User.create (like validation errors) or other issues
    console.error("REGISTRATION FAILED:", error);
     // Send specific Mongoose validation errors if available
     if (error.name === 'ValidationError') {
         const messages = Object.values(error.errors).map(val => val.message);
         return res.status(400).json({ error: messages.join(', ') });
     }
    res.status(500).json({ error: "Server error during registration." });
  }
};


// @desc    Auth user with role and get token
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { admissionNo, role, password } = req.body;

    if (!admissionNo || !role || !password) {
         return res.status(400).json({ error: "Please provide ID, Role, and Password." });
    }

    // Find user by admission number and specified role
    const user = await User.findOne({ admissionNo, role });

    if (user && (await user.matchPassword(password))) {
      // Login successful
      res.json({
        message: "Login successful!",
        token: generateToken(user._id),
        // Send only necessary user info to frontend
        user: { name: user.name, role: user.role, id: user._id },
      });
    } else {
      // Invalid credentials or role doesn't match
      res.status(401).json({ error: "Invalid credentials or role." });
    }
  } catch (error) {
    console.error("LOGIN FAILED:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};

// @desc    Get the logged-in student's room details
// @route   GET /api/users/my-room
export const getMyRoom = async (req, res) => {
  try {
     // Ensure req.user is populated by 'protect' middleware
     if (!req.user || req.user.role !== 'student') {
          return res.status(401).json({ error: "Not authorized or not a student." });
     }

    // Find a room where one of the beds is occupied by the current user
    const room = await Room.findOne({ "beds.occupant": req.user._id });

    if (room) {
      // Find the specific bed the user occupies
      const bed = room.beds.find(b => b.occupant && b.occupant.equals(req.user._id));

      if (bed) {
        res.json({
          roomNumber: room.roomNumber,
          bedNumber: bed.bedNumber,
        });
      } else {
        // This indicates data inconsistency
        console.warn(`User ${req.user._id} found in room ${room._id} occupants, but specific bed not found.`);
        res.status(404).json({ message: "Bed details not found within your assigned room." });
      }
    } else {
      // User hasn't booked a room
      res.status(404).json({ message: "You have not booked a room yet." });
    }
  } catch (error) {
    console.error("GET MY ROOM FAILED:", error);
    res.status(500).json({ error: "Server error while fetching room details." });
  }
};