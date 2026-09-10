import express from "express";
import {
  createTask,
  getTasks,
} from "../controllers/task.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authMiddleware, createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks of the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, getTasks);

export default router;