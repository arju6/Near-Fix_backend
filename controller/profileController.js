import User from "../Models/User.js";
import publicUser from "../utils/publicUser.js";

export const updateProfile = async (req, res) => {
  for (const k of [
    "name",
    "phone",
    "location",
    "service",
    "available",
    "about",
    "experience",
    "hours",
    "latitude",
    "longitude",
  ]) {
    if (req.body[k] !== undefined) {
      if (k === "available") {
        req.user[k] = req.body[k] === true || req.body[k] === "true";
      } else if (k === "latitude" || k === "longitude") {
        req.user[k] =
          req.body[k] === null || req.body[k] === ""
            ? null
            : Number(req.body[k]);
      } else if (k === "experience") {
        req.user[k] =
          req.body[k] === null || req.body[k] === ""
            ? null
            : Number(req.body[k]);
      } else {
        req.user[k] = req.body[k];
      }
    }
  }
  await req.user.save();
  res.json(publicUser(req.user));
};
