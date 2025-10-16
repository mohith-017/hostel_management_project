import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  block: { type: String, required: true },
  floor: { type: Number, required: true },
  roomNumber: { type: String, required: true },
  beds: [
    {
      bedNumber: String,
      isWindowSide: { type: Boolean, default: false },
      occupied: { type: Boolean, default: false },
      occupant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

export default mongoose.model("Room", roomSchema);