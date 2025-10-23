import express from "express";
import { getFeeStatus, payFee } from "../controllers/feeController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// All routes here are protected
router.get("/status", protect, getFeeStatus);
router.post("/pay", protect, payFee);

export default router;