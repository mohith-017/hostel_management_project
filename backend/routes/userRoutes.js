import express from "express";
import { 
  registerUser, 
  loginUser, 
  getMyRoom,
  getUserProfile,      // (NEW)
  updateUserProfile    // (NEW)
} from "../controllers/userController.js"; 
import { protect } from "../middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected, only logged-in users can access
router.get("/my-room", protect, getMyRoom); 

// (NEW) Add these two routes for the profile page
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;