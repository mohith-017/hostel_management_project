import Room from "../models/Room.js";

export const getRoomsByQuery = async (req, res) => {
  try {
    const { block, floor } = req.query;
    const rooms = await Room.find({ block, floor }).populate('beds.occupant', 'name admissionNo');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const bookBed = async (req, res) => {
  try {
    const { roomId, bedNumber } = req.params;
    const room = await Room.findById(roomId);
    const bed = room.beds.find(b => b.bedNumber === bedNumber);

    if (!bed) return res.status(404).json({ message: "Bed not found" });
    if (bed.occupied) return res.status(400).json({ message: "Bed is already booked" });

    bed.occupied = true;
    bed.occupant = req.user.id;
    await room.save();
    res.json({ message: `Bed ${bedNumber} booked successfully!` });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};