import jwt from "jsonwebtoken";
import User from "../Models/User.js";
export default async (req, res, next) => {
  try {
    const p = jwt.verify(
      (req.headers.authorization || "").replace("Bearer ", ""),
      process.env.JWT_SECRET,
    );
    req.user = await User.findById(p.id);
    if (!req.user || req.user.blocked) throw Error();
    next();
  } catch {
    res.status(401).json({ error: "Please sign in" });
  }
};
