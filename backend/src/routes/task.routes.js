import express from "express";
import { createTask } from "../controllers/task.controller.js";
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

export default router;