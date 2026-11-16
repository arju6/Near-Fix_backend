import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import publicUser from "../utils/publicUser.js";
import { verifyGoogleCredential } from "../services/googleAuth.js";
export async function googleLogin(req, res) {
  if (!process.env.GOOGLE_CLIENT_ID)
    return res
      .status(503)
      .json({ error: "Google sign-in is not configured on the server" });
  if (typeof req.body.credential !== "string")
    return res.status(400).json({ error: "Google credential required" });
  let identity;
  try {
    identity = await verifyGoogleCredential(req.body.credential);
  } catch {
    return res
      .status(401)
      .json({ error: "Google identity could not be verified" });
  }
  let user = await User.findOne({ googleId: identity.sub });
  if (!user) {
    const existing = await User.findOne({
      email: identity.email.toLowerCase(),
    });
    if (existing)
      return res
        .status(409)
        .json({
          error:
            "This email already has an account. Sign in with your existing password.",
        });
    user = await User.create({
      name: identity.name || identity.email,
      email: identity.email.toLowerCase(),
      googleId: identity.sub,
      role: req.body.role === "provider" ? "provider" : "user",
    });
  }
  if (user.blocked)
    return res.status(403).json({ error: "Your account is blocked" });
  res.json({
    token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    }),
    user: publicUser(user),
  });
}
