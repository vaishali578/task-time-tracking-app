import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    throw new AppError(
      "Name, email and password are required",
      400
    );
  }

  // Check existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400
    );
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // Send response
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};