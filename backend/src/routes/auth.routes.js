import express from "express";
import {
  signup,
  login,
  logout,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 */
router.post("/signup", asyncHandler(signup));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 */
router.post("/login", asyncHandler(login));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout authenticated user
 *     tags: [Authentication]
 */
router.post("/logout", authMiddleware, logout);

export default router;