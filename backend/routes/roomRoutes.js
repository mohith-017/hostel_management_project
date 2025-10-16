import express from "express";
import { getRoomsByQuery, bookBed } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/query", getRoomsByQuery);
router.post("/book/:roomId/:bedNumber", protect, bookBed);

export default router;