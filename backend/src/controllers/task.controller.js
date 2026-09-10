import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";

export const createTask = async (req, res) => {
  const { title, description } = req.body;

  // Validate title
  if (!title || !title.trim()) {
    throw new AppError("Task title is required", 400);
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

  const task = await Task.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (title !== undefined) {
    if (!title.trim()) {
      throw new AppError("Task title cannot be empty", 400);
    }

    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (status !== undefined) {
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      throw new AppError("Invalid task status", 400);
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