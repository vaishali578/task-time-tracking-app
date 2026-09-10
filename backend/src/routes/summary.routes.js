import express from "express";
import { getDailySummary } from "../controllers/summary.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/summary/daily:
 *   get:
 *     summary: Get today's task and time tracking summary
 *     tags: [Summary]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily summary retrieved successfully
 */
router.get(
  "/daily",
  authMiddleware,
  asyncHandler(getDailySummary)
);

export default router;