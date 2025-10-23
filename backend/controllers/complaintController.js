import Complaint from "../models/Complaint.js";

// @desc    Create a new complaint
// @route   POST /api/complaints/submit
export const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    if (!category || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const complaint = await Complaint.create({
      student: req.user.id,
      category,
      description,
      status: "Submitted",
    });
    res.status(201).json({ message: "Complaint submitted successfully!", complaint });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all complaints for the logged-in student
// @route   GET /api/complaints/my-complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ... (keep createComplaint and getMyComplaints) ...

// (NEW FUNCTION FOR ADMIN)
// @desc    Update complaint status
// @route   PUT /api/complaints/:id
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ message: "Status updated!", complaint });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};