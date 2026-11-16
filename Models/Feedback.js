import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    kind: { type: String, enum: ["review", "complaint"], required: true },
    text: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    status: {
      type: String,
      default: "Open",
      enum: ["Open", "In Review", "Resolved"],
    },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ user: 1, request: 1, kind: 1 }, { unique: true });
export default mongoose.model("Feedback", schema);
