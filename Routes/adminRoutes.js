import { Router } from "express";
import wrap from "../utils/asyncHandler.js";
import { listUsers, verifyProvider } from "../controller/adminController.js";
const router = Router();
router.get("/users", wrap(listUsers));
router.patch("/users/:id/verify", wrap(verifyProvider));
export default router;
