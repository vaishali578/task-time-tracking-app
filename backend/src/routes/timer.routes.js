import express from "express";
import { startTimer } from "../controllers/timer.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @swagger
 * /api/tasks/{taskId}/timer/start:
 *   post:
 *     summary: Start timer for a task
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 */
router.post(
  "/:taskId/timer/start",
  authMiddleware,
  asyncHandler(startTimer)
);

export default router;