import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import publicUser from "../utils/publicUser.js";

export const authenticate = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 8
  )
    return res
      .status(400)
      .json({
        error: "Email and a password of at least 8 characters are required",
      });
  let u;
  if (req.params.action === "register") {
    if (!name) return res.status(400).json({ error: "Name required" });
    u = await User.create({
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      role: role === "provider" ? "provider" : "user",
    });
  } else {
    u = await User.findOne({ email: email.toLowerCase() });
    if (
      !u ||
      u.blocked ||
      !u.password ||
      !(await bcrypt.compare(password, u.password))
    )
      return res.status(401).json({ error: "Invalid credentials" });
  }
  res.json({
    token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: "1d" }),
    user: publicUser(u),
  });
};
