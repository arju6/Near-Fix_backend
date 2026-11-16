import mongoose from "mongoose";
const Request = mongoose.model(
  "Request",
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      estimate: Number,
      arrivalMinutes: Number,
      emergency: { type: Boolean, default: false },
      service: String,
      description: String,
      location: String,
      latitude: Number,
      longitude: Number,
      status: { type: String, default: "Pending" },
    },
    { timestamps: true },
  ),
);
export default Request;
