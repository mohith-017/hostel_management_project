import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 50000, // Example fee amount
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  paymentDate: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.model("Fee", feeSchema);