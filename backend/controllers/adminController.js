import User from "../models/User.js";
import Fee from "../models/Fee.js";
import Complaint from "../models/Complaint.js";

// @desc    Get dashboard stats (complaints, fees due)
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const pendingComplaints = await Complaint.countDocuments({ 
      status: { $in: ['Submitted', 'In Progress'] } 
    });
    const pendingFees = await Fee.countDocuments({ status: 'pending' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({ pendingComplaints, pendingFees, totalStudents });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all pending complaints
// @route   GET /api/admin/complaints
export const getPendingComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ status: { $in: ['Submitted', 'In Progress'] } })
      .populate('student', 'name admissionNo semester studentPhone')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all pending fees
// @route   GET /api/admin/fees
export const getPendingFees = async (req, res) => {
  try {
    const fees = await Fee.find({ status: 'pending' })
      .populate('student', 'name admissionNo semester studentPhone')
      .sort({ createdAt: 1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};