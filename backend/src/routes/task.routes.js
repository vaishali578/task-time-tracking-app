import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

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
router.post("/", authMiddleware, asyncHandler(createTask));

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks of the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authMiddleware, asyncHandler(getTasks));

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", authMiddleware, asyncHandler(getTask));

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authMiddleware, asyncHandler(updateTask));


/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authMiddleware, asyncHandler(deleteTask));

export default router;