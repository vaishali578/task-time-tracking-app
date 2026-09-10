import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import timerRoutes from "./routes/timer.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Task Tracking API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", timerRoutes);
app.use(errorMiddleware);

export default app;