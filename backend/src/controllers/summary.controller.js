import Task from "../models/Task.js";
import TimeLog from "../models/TimeLog.js";

export const getDailySummary = async (req, res) => {
  const userId = req.user.id;

  // Start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Get today's completed time logs
  const timeLogs = await TimeLog.find({
    user: userId,
    startTime: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    endTime: { $ne: null },
  });

  // Calculate total tracked time
  const totalTrackedTime = timeLogs.reduce(
    (total, log) => total + log.duration,
    0
  );

  // Unique tasks worked on today
  const taskIds = [
    ...new Set(timeLogs.map((log) => log.task.toString())),
  ];

  // Get user's tasks
  const tasks = await Task.find({
    user: userId,
  });

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  res.status(200).json({
    success: true,
    date: startOfDay.toISOString().split("T")[0],
    summary: {
      totalTrackedTime,
      tasksWorkedOn: taskIds.length,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    },
  });
};