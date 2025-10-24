import express from "express";
import { registerUser, loginUser, getMyRoom } from "../controllers/userController.js"; // (Import new function)
import { protect } from "../middleware/authMiddleware.js"; // (Import protect)

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// (NEW ROUTE) - Protected, only logged-in users can access
router.get("/my-room", protect, getMyRoom); 

export default router;