import Announcement from "../models/Announcement.js";

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Admin
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }
    
    const announcement = new Announcement({
      title,
      content,
      author: req.user.id, // from 'protect' middleware
    });
    
    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Protected (Students & Admin)
export const getAnnouncements = async (req, res) => {
  try {
    // Get latest 10
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('author', 'name'); // Show who posted it
      
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (announcement) {
      await announcement.deleteOne();
      res.json({ message: "Announcement removed" });
    } else {
      res.status(4404).json({ error: "Announcement not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};