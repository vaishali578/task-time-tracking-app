import Task from "../models/Task.js";
import TimeLog from "../models/TimeLog.js";
import AppError from "../utils/AppError.js";

export const startTimer = async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findOne({
    _id: taskId,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

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


export const stopTimer = async (req, res) => {
  const { taskId } = req.params;

  // 1. Check task ownership
  const task = await Task.findOne({
    _id: taskId,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 2. Find active timer for this task
  const activeTimer = await TimeLog.findOne({
    task: taskId,
    user: req.user.id,
    endTime: null,
  });

  if (!activeTimer) {
    throw new AppError(
      "No active timer found for this task",
      400
    );
  }

  // 3. Set end time
  const endTime = new Date();

  activeTimer.endTime = endTime;

  // 4. Calculate duration in milliseconds
  activeTimer.duration =
    endTime.getTime() - activeTimer.startTime.getTime();

  // 5. Save
  await activeTimer.save();

  res.status(200).json({
    success: true,
    message: "Timer stopped successfully",
    timeLog: activeTimer,
  });
};

export const getTimerLogs = async (req, res) => {
  const { taskId } = req.params;

  // Check task ownership
  const task = await Task.findOne({
    _id: taskId,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Get all timer logs for this task
  const timeLogs = await TimeLog.find({
    task: taskId,
    user: req.user.id,
  }).sort({ startTime: -1 });

  res.status(200).json({
    success: true,
    count: timeLogs.length,
    timeLogs,
  });
};

export const getTotalTime = async (req, res) => {
  const { taskId } = req.params;

  // Check task ownership
  const task = await Task.findOne({
    _id: taskId,
    user: req.user.id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // Get all completed time logs
  const timeLogs = await TimeLog.find({
    task: taskId,
    user: req.user.id,
    endTime: { $ne: null },
  });

  // Calculate total duration
  const totalDuration = timeLogs.reduce(
    (total, log) => total + log.duration,
    0
  );

  res.status(200).json({
    success: true,
    taskId,
    totalDuration,
    totalSessions: timeLogs.length,
  });
};