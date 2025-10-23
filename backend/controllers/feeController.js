import Fee from "../models/Fee.js";

// @desc    Get student's fee status
// @route   GET /api/fees/status
export const getFeeStatus = async (req, res) => {
  try {
    let fee = await Fee.findOne({ student: req.user.id });

    // If no fee record exists, create one for the student (simulates new semester billing)
    if (!fee) {
      fee = await Fee.create({
        student: req.user.id,
        amount: 50000, // Default amount
        status: "pending",
      });
    }
    res.json(fee);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    "Pay" the fee (simulated)
// @route   POST /api/fees/pay
export const payFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({ student: req.user.id });

    if (!fee) return res.status(404).json({ error: "No fee record found" });
    if (fee.status === "paid") return res.status(400).json({ error: "Fee is already paid" });

    fee.status = "paid";
    fee.paymentDate = Date.now();
    await fee.save();

    res.json({ message: "Fee paid successfully!", fee });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};