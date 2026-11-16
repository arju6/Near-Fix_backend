import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import wrap from "../utils/asyncHandler.js";
import { authenticate } from "../controller/authController.js";
import { googleLogin } from "../controller/googleController.js";
const router = Router();
router.use(
  "/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Try again later." },
  }),
);
router.post("/auth/google", wrap(googleLogin));
router.post("/auth/register", (req, res, next) => {
  req.params.action = "register";
  return wrap(authenticate)(req, res, next);
});
router.post("/auth/login", (req, res, next) => {
  req.params.action = "login";
  return wrap(authenticate)(req, res, next);
});
export default router;
