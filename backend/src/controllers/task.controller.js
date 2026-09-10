import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";

const ALLOWED_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

export const createTask = async (req, res) => {
  const { title, description } = req.body;

  // Validate title
  if (typeof title !== "string" || !title.trim()) {
    throw new AppError("Task title is required", 400);
  }

  if (title.trim().length > MAX_TITLE_LENGTH) {
    throw new AppError(
      `Task title cannot exceed ${MAX_TITLE_LENGTH} characters`,
      400
    );
  }

  // Validate description
  if (description !== undefined && typeof description !== "string") {
    throw new AppError("Task description must be a string", 400);
  }

  if (
    description &&
    description.trim().length > MAX_DESCRIPTION_LENGTH
  ) {
    throw new AppError(
      `Task description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      400
    );
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find({
    user: req.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
};

export const getTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    task,
  });
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  // Find only user's own task
  const task = await Task.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Validate title
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      throw new AppError("Task title cannot be empty", 400);
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      throw new AppError(
        `Task title cannot exceed ${MAX_TITLE_LENGTH} characters`,
        400
      );
    }

    task.title = title.trim();
  }

  // Validate description
  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new AppError("Task description must be a string", 400);
    }

    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      throw new AppError(
        `Task description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        400
      );
    }

    task.description = description.trim();
  }

  // Validate status
  if (status !== undefined) {
    if (!ALLOWED_STATUSES.includes(status)) {
      throw new AppError(
        "Invalid task status. Allowed values: Pending, In Progress, Completed",
        400
      );
    }

    task.status = status;
  }

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task,
  });
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOneAndDelete({
    _id: id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};