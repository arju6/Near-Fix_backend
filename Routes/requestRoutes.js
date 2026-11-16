import { Router } from "express";
import wrap from "../utils/asyncHandler.js";
import {
  listRequests,
  createRequest,
  updateRequest,
} from "../controller/requestController.js";
const router = Router();
router.get("/requests", wrap(listRequests));
router.post("/requests", wrap(createRequest));
router.patch("/requests/:id", wrap(updateRequest));
export default router;
