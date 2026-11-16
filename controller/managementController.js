import User from "../Models/User.js";
import Request from "../Models/Request.js";
import Feedback from "../Models/Feedback.js";
import Category from "../Models/Category.js";
const admin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Administrator access required" });
    return false;
  }
  return true;
};
export async function categories(req, res) {
  await Promise.all(
    [
      "Electrician",
      "Plumber",
      "Vehicle Assistance",
      "AC Wash Service",
      "Home Massage & Spa",
    ].map((name) =>
      Category.updateOne(
        { name },
        { $setOnInsert: { name, active: true } },
        { upsert: true },
      ),
    ),
  );
  res.json(
    await Category.find(req.user.role === "admin" ? {} : { active: true }).sort(
      { name: 1 },
    ),
  );
}
export async function editCategory(req, res) {
  if (!admin(req, res)) return;
  const { name, description, active } = req.body;
  if (req.params.id) {
    res.json(
      await Category.findByIdAndUpdate(
        req.params.id,
        { description, active },
        { new: true, runValidators: true },
      ),
    );
  } else {
    if (typeof name !== "string" || !name.trim())
      return res.status(400).json({ error: "Category name required" });
    res.json(await Category.create({ name: name.trim(), description }));
  }
}
export async function account(req, res) {
  if (!admin(req, res)) return;
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: "You cannot block your own account" });
  const user = await User.findById(req.params.id);
  if (!user || user.role === "admin")
    return res.status(400).json({ error: "Account cannot be changed" });
  if (typeof req.body.blocked === "boolean") user.blocked = req.body.blocked;
  if (user.role === "provider" && typeof req.body.verified === "boolean")
    user.verified = req.body.verified;
  await user.save();
  res.json({ message: "Account updated" });
}
export async function feedback(req, res) {
  const filter = req.user.role === "admin" ? {} : { user: req.user.id };
  if (req.query.kind) filter.kind = req.query.kind;
  res.json(
    await Feedback.find(filter)
      .populate("user", "name")
      .populate("request", "service status")
      .sort({ createdAt: -1 }),
  );
}
export async function addFeedback(req, res) {
  if (req.user.role !== "user") return res.sendStatus(403);
  const { request, kind, text, rating } = req.body;
  const job = await Request.findOne({ _id: request, user: req.user.id });
  if (!job || !text?.trim() || !["review", "complaint"].includes(kind))
    return res
      .status(400)
      .json({ error: "Choose your request and enter feedback" });
  if (
    kind === "review" &&
    (job.status !== "Completed" ||
      !Number.isInteger(Number(rating)) ||
      rating < 1 ||
      rating > 5)
  )
    return res
      .status(400)
      .json({
        error: "Reviews require a completed request and a rating from 1 to 5",
      });
  res.json(
    await Feedback.create({
      user: req.user.id,
      request,
      kind,
      text: text.trim(),
      rating: kind === "review" ? Number(rating) : undefined,
    }),
  );
}
export async function moderateFeedback(req, res) {
  if (!admin(req, res)) return;
  const update = {};
  if (req.body.status) update.status = req.body.status;
  if (typeof req.body.hidden === "boolean") update.hidden = req.body.hidden;
  res.json(
    await Feedback.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }),
  );
}
export async function estimate(req, res) {
  if (req.user.role !== "provider") return res.sendStatus(403);
  const { estimate, arrivalMinutes } = req.body;
  if (
    !Number.isFinite(Number(estimate)) ||
    Number(estimate) < 0 ||
    !Number.isFinite(Number(arrivalMinutes)) ||
    Number(arrivalMinutes) < 0
  )
    return res
      .status(400)
      .json({ error: "Enter nonnegative cost and arrival time" });
  const job = await Request.findOneAndUpdate(
    {
      _id: req.params.id,
      provider: req.user.id,
      status: { $in: ["Accepted", "On the Way", "In Progress"] },
    },
    {
      $set: {
        estimate: Number(estimate),
        arrivalMinutes: Number(arrivalMinutes),
      },
    },
    { new: true },
  );
  if (!job) return res.sendStatus(403);
  res.json(job);
}
export async function me(req, res) {
  const u = req.user.toObject();
  delete u.password;
  res.json(u);
}
