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
      .populate('student', 'name usn semester studentPhone')
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
      .populate('student', 'name usn semester studentPhone')
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

// @desc    Update a student's details (by Admin)
// @route   PUT /api/admin/students/:id
export const updateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: "Student not found" });
    }

    // Update only the fields provided in the body
    if (req.body.studentPhone) student.studentPhone = req.body.studentPhone;
    if (req.body.parentPhone) student.parentPhone = req.body.parentPhone;
    if (req.body.address) student.address = req.body.address;
    if (req.body.semester) student.semester = req.body.semester;

    const updatedStudent = await student.save();
    res.json({ message: "Student updated successfully", student: updatedStudent });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


// === (NEW) FUNCTION 1 ===
// @desc    Get fee status for a specific student
// @route   GET /api/admin/student/:id/fees
export const getStudentFeeStatus = async (req, res) => {
  try {
    const fee = await Fee.findOne({ student: req.params.id });
    if (!fee) {
      return res.status(404).json({ error: "No fee record found for this student." });
    }
    res.json(fee);
  } catch (error) {
     res.status(500).json({ error: "Server error" });
  }
};

// === (NEW) FUNCTION 2 ===
// @desc    Get pending complaints for a specific student
// @route   GET /api/admin/student/:id/complaints
export const getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      student: req.params.id,
      status: { $in: ['Submitted', 'In Progress'] }
    }).sort({ createdAt: -1 });
    
    // It's not an error to have no complaints, just return an empty array
    res.json(complaints); 
  } catch (error) {
     res.status(500).json({ error: "Server error" });
  }
};