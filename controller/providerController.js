import User from "../Models/User.js";
import Feedback from "../Models/Feedback.js";

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

export async function listProviders(req, res) {
  const users = await User.find({
    role: "provider",
    verified: true,
    blocked: { $ne: true },
  }).select(
    "name service location available about experience hours latitude longitude",
  );
  const reviews = await Feedback.find({
    kind: "review",
    hidden: false,
  }).populate("request", "provider");

  const refLat =
    req.query.lat != null
      ? Number(req.query.lat)
      : req.user?.latitude != null
        ? req.user.latitude
        : null;
  const refLon =
    req.query.lng != null
      ? Number(req.query.lng)
      : req.user?.longitude != null
        ? req.user.longitude
        : null;

  const result = users.map((u) => {
    const ratings = reviews.filter((r) => String(r.request?.provider) === u.id);
    const dist = calcDist(refLat, refLon, u.latitude, u.longitude);
    return {
      ...u.toObject(),
      distance: dist,
      rating: ratings.length
        ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
        : 0,
      reviewCount: ratings.length,
    };
  });

  if (req.query.sort === "distance") {
    result.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }

  res.json(result);
}
