import Room from "../models/Room.js";

export const getRoomsByQuery = async (req, res) => {
  try {
    const { block, floor } = req.query;
    const rooms = await Room.find({ block, floor }).populate('beds.occupant', 'name usn');
    res.json(rooms);
  } catch (err) {
    // (FIX 1) Send 'error' property so the popper can read it
    res.status(500).json({ error: "Server Error" });
  }
};

export const bookBed = async (req, res) => {
  try {
    const { roomId, bedNumber } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const bed = room.beds.find(b => b.bedNumber === bedNumber);

    if (!bed) {
      // (FIX 1) Send 'error' property
      return res.status(404).json({ error: "Bed not found" });
    }

    if (bed.occupied) {
      // (FIX 1) Send 'error' property
      return res.status(400).json({ error: "Bed is already booked" });
    }

    // Update the bed properties
    bed.occupied = true;
    bed.occupant = req.user.id;

    // --- (THE MAIN FIX) ---
    // Tell Mongoose that the 'beds' array has been modified
    room.markModified('beds');
    // --- (END OF FIX) ---

    await room.save(); // This will now correctly save the change

    res.json({ message: `Bed ${bedNumber} booked successfully!` });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    // (FIX 1) Send 'error' property
    res.status(500).json({ error: "Server Error" });
  }
};