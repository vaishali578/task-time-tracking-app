import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  const { title, description } = req.body;

  // Validate title
  if (!title || !title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
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