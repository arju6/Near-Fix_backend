import User from "../Models/User.js";

export const listUsers = async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  res.json(await User.find().select("-password"));
};

export const verifyProvider = async (req, res) => {
  if (req.user.role !== "admin") return res.sendStatus(403);
  res.json(
    await User.findOneAndUpdate(
      { _id: req.params.id, role: "provider" },
      { verified: true },
      { new: true },
    ).select("-password"),
  );
};
