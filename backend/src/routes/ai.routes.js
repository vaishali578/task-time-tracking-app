import express from "express";
import { suggestTask } from "../controllers/ai.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/suggest", authMiddleware, asyncHandler(suggestTask));

export default router;
