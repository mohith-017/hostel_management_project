import express from "express";
import {
  getDashboardStats,
  getPendingComplaints,
  getPendingFees,
  getAllStudents,
  updateStudent,
  getStudentFeeStatus,     // (NEW)
  getStudentComplaints     // (NEW)
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes here are protected and admin-only
router.get("/stats", protect, admin, getDashboardStats);
router.get("/complaints", protect, admin, getPendingComplaints);
router.get("/fees", protect, admin, getPendingFees);
router.get("/students", protect, admin, getAllStudents);

// (MODIFIED) Route for updating a student
router.put("/students/:id", protect, admin, updateStudent);

// === (NEW) Routes for specific student data ===
router.get("/student/:id/fees", protect, admin, getStudentFeeStatus);
router.get("/student/:id/complaints", protect, admin, getStudentComplaints);

export default router;