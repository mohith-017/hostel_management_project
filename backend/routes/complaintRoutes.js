import express from "express";
import { 
  createComplaint, 
  getMyComplaints, 
  updateComplaintStatus // (Import new function)
} from "../controllers/complaintController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // (Import admin)

const router = express.Router();

// Student routes
router.post("/submit", protect, createComplaint);
router.get("/my-complaints", protect, getMyComplaints);

// (NEW ADMIN ROUTE)
router.put("/:id", protect, admin, updateComplaintStatus);

export default router;