import express from "express";
import { startTimer, stopTimer, getTimerLogs, getTotalTime, getActiveTimer } from "../controllers/timer.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/timer/active",
  authMiddleware,
  asyncHandler(getActiveTimer)
);

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

/**
 * @swagger
 * /api/tasks/{taskId}/timer/stop:
 *   post:
 *     summary: Stop the active timer for a task
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
  "/:taskId/timer/stop",
  authMiddleware,
  asyncHandler(stopTimer)
);

/**
 * @swagger
 * /api/tasks/{taskId}/timer/logs:
 *   get:
 *     summary: Get all timer logs for a task
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
router.get(
  "/:taskId/timer/logs",
  authMiddleware,
  asyncHandler(getTimerLogs)
);

/**
 * @swagger
 * /api/tasks/{taskId}/timer/total:
 *   get:
 *     summary: Get total tracked time for a task
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
router.get(
  "/:taskId/timer/total",
  authMiddleware,
  asyncHandler(getTotalTime)
);

export default router;