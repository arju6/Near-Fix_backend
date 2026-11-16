import { Router } from "express";
import wrap from "../utils/asyncHandler.js";
import { updateProfile } from "../controller/profileController.js";
const router = Router();
router.patch("/profile", wrap(updateProfile));
export default router;
