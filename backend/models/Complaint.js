import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Electrical", "Plumbing", "Mess", "Wi-Fi", "Other"],
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Submitted", "In Progress", "Resolved"],
    default: "Submitted",
  },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);