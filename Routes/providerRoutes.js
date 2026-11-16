import { Router } from "express";
import wrap from "../utils/asyncHandler.js";
import { listProviders } from "../controller/providerController.js";
const router = Router();
router.get("/providers", wrap(listProviders));
export default router;
