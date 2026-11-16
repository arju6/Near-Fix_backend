import Category from "../Models/Category.js";
import User from "../Models/User.js";
import Request from "../Models/Request.js";

function calcDist(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const rad = (n) => (n * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) *
      Math.cos(rad(lat2)) *
      Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return Number(
    (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1),
  );
}

export const listRequests = async (req, res) => {
  const query =
    req.user.role === "admin"
      ? {}
      : req.user.role === "provider"
        ? {
            $or: [
              { provider: req.user.id },
              {
                status: "Pending",
                service:
                  req.user.verified && req.user.available
                    ? req.user.service
                    : "__unavailable__",
                rejectedBy: { $ne: req.user._id },
              },
            ],
          }
        : { user: req.user.id };

  const requests = await Request.find(query)
    .populate("user provider", "name phone location latitude longitude")
    .sort({ createdAt: -1 });

  const refLat =
    req.query.lat != null
      ? Number(req.query.lat)
      : req.user.latitude != null
        ? req.user.latitude
        : null;
  const refLon =
    req.query.lng != null
      ? Number(req.query.lng)
      : req.user.longitude != null
        ? req.user.longitude
        : null;

  const enriched = requests.map((r) => {
    const item = r.toObject();
    const jobLat = item.latitude ?? item.user?.latitude ?? null;
    const jobLon = item.longitude ?? item.user?.longitude ?? null;
    item.latitude = jobLat;
    item.longitude = jobLon;
    item.distance = calcDist(refLat, refLon, jobLat, jobLon);
    return item;
  });

  if (req.query.sort === "distance") {
    enriched.sort(
      (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
    );
  }

  res.json(enriched);
};

export const createRequest = async (req, res) => {
  if (req.user.role !== "user") return res.sendStatus(403);
  const { service, description, location, latitude, longitude, emergency } =
    req.body;
  if (
    !(await Category.exists({ name: service, active: true })) ||
    !description ||
    !location
  )
    return res.status(400).json({ error: "Complete all request fields" });

  const lat =
    latitude !== undefined && latitude !== null && latitude !== ""
      ? Number(latitude)
      : (req.user.latitude ?? null);
  const lon =
    longitude !== undefined && longitude !== null && longitude !== ""
      ? Number(longitude)
      : (req.user.longitude ?? null);

  const newReq = await Request.create({
    user: req.user.id,
    service,
    description,
    location,
    latitude: lat,
    longitude: lon,
    emergency: Boolean(emergency),
  });

  res.json(newReq);
};

export const updateRequest = async (req, res) => {
  const r = await Request.findById(req.params.id);
  if (!r) return res.sendStatus(404);
  const s = req.body.status;

  if (
    req.user.role === "user" &&
    String(r.user) === req.user.id &&
    s === "Cancelled" &&
    ["Pending", "Accepted"].includes(r.status)
  ) {
    r.status = s;
  } else if (req.user.role === "provider" && req.user.verified) {
    if (
      s === "Rejected" &&
      r.status === "Pending" &&
      r.service === req.user.service
    ) {
      await Request.updateOne(
        { _id: r.id },
        { $addToSet: { rejectedBy: req.user._id } },
      );
      return res.json({ message: "Request declined" });
    }
    if (s === "Accepted") {
      if (!req.user.available)
        return res
          .status(409)
          .json({ error: "Set yourself available before accepting jobs" });
      const updated = await Request.findOneAndUpdate(
        {
          _id: r.id,
          status: "Pending",
          service: req.user.service,
          rejectedBy: { $ne: req.user._id },
        },
        { $set: { provider: req.user.id, status: s } },
        { new: true },
      );
      return updated
        ? res.json(updated)
        : res.status(409).json({ error: "Request already assigned" });
    }
    const next = {
      Accepted: "On the Way",
      "On the Way": "In Progress",
      "In Progress": "Completed",
    };
    if (String(r.provider) !== req.user.id || next[r.status] !== s)
      return res.sendStatus(403);
    r.status = s;
  } else {
    return res.sendStatus(403);
  }

  await r.save();
  res.json(r);
};
