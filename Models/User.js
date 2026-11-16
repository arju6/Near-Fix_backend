import mongoose from "mongoose";
const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      googleId: { type: String, unique: true, sparse: true },
      blocked: { type: Boolean, default: false },
      about: String,
      experience: Number,
      hours: String,
      latitude: Number,
      longitude: Number,
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      phone: String,
      location: String,
      service: String,
      available: { type: Boolean, default: false },
      verified: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
export default User;
