import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} from "../controllers/announcementController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect = must be logged in
// admin = must be an admin

router.route("/")
  .post(protect, admin, createAnnouncement) // Only admins can create
  .get(protect, getAnnouncements);          // All logged-in users can read

router.route("/:id")
  .delete(protect, admin, deleteAnnouncement); // Only admins can delete

export default router;