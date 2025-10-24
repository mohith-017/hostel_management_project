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
    // (UPDATED) Destructure all new fields
    const { 
      name, admissionNo, role, password,
      semester, studentPhone, parentName, parentPhone, address, // Student fields
      post // Admin fields
    } = req.body;

    if (!name || !admissionNo || !role || !password) {
      return res.status(400).json({ error: "Please fill all required fields." });
    }

    const userExists = await User.findOne({ admissionNo });
    if (userExists) {
      return res.status(400).json({ error: "User with this ID already exists!" });
    }

    // (UPDATED) Add all new fields to the user data object
    const userData = { name, admissionNo, role, password };
    if (role === 'student') {
      userData.semester = semester;
      userData.studentPhone = studentPhone;
      userData.parentName = parentName;
      userData.parentPhone = parentPhone;
      userData.address = address;
    }
    if (role === 'admin') {
      userData.post = post;
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({ message: "Registration successful! Please login." });
    } else {
      res.status(400).json({ error: "Invalid user data." });
    }
  } catch (error) {
    console.error("REGISTRATION FAILED:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

// @desc    Auth user with role and get token
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { admissionNo, role, password } = req.body;
    const user = await User.findOne({ admissionNo, role }); // Check both ID and role

    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "Login successful!",
        token: generateToken(user._id),
        user: { name: user.name, role: user.role, id: user._id }, // (Updated to send ID)
      });
    } else {
      res.status(401).json({ error: "Invalid credentials or role." });
    }
  } catch (error) {
    console.error("LOGIN FAILED:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};

// (NEW FUNCTION)
// @desc    Get the logged-in student's room details
// @route   GET /api/users/my-room
export const getMyRoom = async (req, res) => {
  try {
    // Find a room where one of the beds is occupied by the current user
    const room = await Room.findOne({ "beds.occupant": req.user._id });

    if (room) {
      // Find the specific bed the user occupies
      const bed = room.beds.find(b => b.occupant.equals(req.user._id));
      
      if (bed) {
        res.json({
          roomNumber: room.roomNumber,
          bedNumber: bed.bedNumber,
        });
      } else {
        // Should ideally not happen if the room was found, but good to handle
        res.status(404).json({ message: "Bed details not found, though room was located." });
      }
    } else {
      res.status(404).json({ message: "You have not booked a room yet." });
    }
  } catch (error) {
    console.error("GET MY ROOM FAILED:", error);
    res.status(500).json({ error: "Server error while fetching room details." });
  }
};