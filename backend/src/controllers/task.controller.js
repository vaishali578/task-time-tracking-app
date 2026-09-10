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

export const getTask = async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({
    _id: id,
    user: req.user.id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
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
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title cannot be empty",
      });
    }

    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (status !== undefined) {
    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
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
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};