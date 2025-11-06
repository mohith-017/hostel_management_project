import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links to the admin who posted it
    required: true,
  },
}, { timestamps: true }); // Automatically adds createdAt

export default mongoose.model("Announcement", announcementSchema);