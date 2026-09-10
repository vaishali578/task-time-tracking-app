import Task from "../models/Task.js";
import TimeLog from "../models/TimeLog.js";
import AppError from "../utils/AppError.js";

export const startTimer = async (req, res) => {
  const { taskId } = req.params;

  // 1. Check task ownership
  const task = await Task.findOne({
    _id: taskId,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 2. Check if user already has an active timer
  const activeTimer = await TimeLog.findOne({
    user: req.user.id,
    endTime: null,
  });

  if (activeTimer) {
    throw new AppError(
      "You already have an active timer",
      400
    );
  }

  // 3. Create new time log
  const timeLog = await TimeLog.create({
    task: task._id,
    user: req.user.id,
    startTime: new Date(),
  });

  res.status(201).json({
    success: true,
    message: "Timer started successfully",
    timeLog,
  });
};