import express from "express";
import {
  getDashboardStats,
  getPendingComplaints,
  getPendingFees,
  getAllStudents
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected and admin-only
router.get("/stats", protect, admin, getDashboardStats);
router.get("/complaints", protect, admin, getPendingComplaints);
router.get("/fees", protect, admin, getPendingFees);
router.get("/students", protect, admin, getAllStudents);

export default router;