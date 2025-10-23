import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admissionNo: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["student", "admin"],
    required: true,
  },
  password: { type: String, required: true },

  // --- (NEW) Student-Specific Fields ---
  semester: { type: String }, // (Already existed)
  studentPhone: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  address: { type: String },

  // --- (NEW) Admin-Specific Field ---
  post: { type: String },     // (Already existed)

}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);