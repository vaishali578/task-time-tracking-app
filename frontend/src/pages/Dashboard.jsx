import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authStore from "../store/authStore";
import { getDailySummary } from "../services/summary";
import { logoutUser } from "../services/auth";
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    getTimerLogs,
    getTotalTime,
    getActiveTimer,
    suggestTaskAI,
} from "../services/task";

const Dashboard = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const handleAISuggestion = async () => {
        if (!aiPrompt.trim()) return;
        try {
            setAiLoading(true);
            setFormError("");
            const data = await suggestTaskAI(aiPrompt.trim());
            if (data && data.suggestion) {
                setFormData({
                    title: data.suggestion.title,
                    description: data.suggestion.description,
                });
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "AI suggestion failed");
        } finally {
            setAiLoading(false);
        }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTask, setDeletingTask] = useState(null);

    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [activeTimer, setActiveTimer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerLoading, setTimerLoading] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);
    const [timerLogs, setTimerLogs] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [logsLoading, setLogsLoading] = useState(false);

    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout API error:", err);
        } finally {
            logout();
            navigate("/login");
        }
    };

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getTasks();
            setTasks(data.tasks || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load tasks. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch daily summary safely
    const fetchSummary = async () => {
        try {
            setSummaryLoading(true);
            const data = await getDailySummary();
            if (data && data.summary) {
                setSummary(data.summary);
            }
        } catch (err) {
            console.warn("Failed to refresh summary:", err);
        } finally {
            setSummaryLoading(false);
        }
    };

    // Fetch active timer on load
    const fetchActiveTimer = async () => {
        try {
            const data = await getActiveTimer();
            if (data && data.timeLog) {
                setActiveTimer(data.timeLog);
            } else {
                setActiveTimer(null);
            }
        } catch (err) {
            console.warn("Failed to fetch active timer:", err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchSummary();
        fetchActiveTimer();
    }, []);

    // Live timer ticker update effect
    useEffect(() => {
        if (!activeTimer) {
            setElapsedTime(0);
            return;
        }

        const updateElapsedTime = () => {
            const start = new Date(activeTimer.startTime).getTime();
            const now = Date.now();
            setElapsedTime(Math.max(0, now - start));
        };

        updateElapsedTime();
        const interval = setInterval(updateElapsedTime, 1000);
        return () => clearInterval(interval);
    }, [activeTimer]);

    // Handle create/edit input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Create or Update task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!formData.title.trim()) {
            setFormError("Task title is required");
            return;
        }

        if (formData.title.trim().length > 200) {
            setFormError("Task title cannot exceed 200 characters");
            return;
        }

        if (formData.description.length > 2000) {
            setFormError("Description cannot exceed 2000 characters");
            return;
        }

        try {
            setSubmitting(true);
            setActionError("");

            if (editingTask) {
                await updateTask(editingTask._id, {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                });
            } else {
                await createTask({
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                });
            }

            await fetchTasks();
            await fetchSummary();

            setFormData({ title: "", description: "" });
            setEditingTask(null);
            setShowCreateModal(false);
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                `Failed to ${editingTask ? "update" : "create"} task`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || "",
        });
        setFormError("");
        setShowCreateModal(true);
    };

    const handleDeleteTask = async () => {
        if (!deletingTask) return;

        try {
            setActionLoading(true);
            setActionError("");

            await deleteTask(deletingTask._id);
            await fetchTasks();
            await fetchSummary();

            setDeletingTask(null);
            setShowDeleteModal(false);
        } catch (err) {
            setActionError(
                err.response?.data?.message || "Failed to delete task"
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            setActionError("");
            await updateTask(taskId, { status });
            await fetchTasks();
            await fetchSummary();
        } catch (err) {
            setActionError(
                err.response?.data?.message || "Failed to update task status"
            );
        }
    };

    const handleCloseModal = () => {
        if (submitting) return;
        setShowCreateModal(false);
        setEditingTask(null);
        setFormData({ title: "", description: "" });
        setFormError("");
    };

    const handleStartTimer = async (taskId) => {
        try {
            setTimerLoading(true);
            setActionError("");
            const data = await startTimer(taskId);
            if (data.timeLog) {
                setActiveTimer(data.timeLog);
            }
            await fetchSummary();
        } catch (err) {
            setActionError(
                err.response?.data?.message || "Failed to start timer"
            );
        } finally {
            setTimerLoading(false);
        }
    };

    const handleStopTimer = async (taskId) => {
        try {
            setTimerLoading(true);
            setActionError("");
            await stopTimer(taskId);
            setActiveTimer(null);
            setElapsedTime(0);
            await fetchSummary();
        } catch (err) {
            setActionError(
                err.response?.data?.message || "Failed to stop timer"
            );
        } finally {
            setTimerLoading(false);
        }
    };

    const handleViewLogs = async (task) => {
        try {
            setLogsLoading(true);
            setActionError("");
            setSelectedTask(task);

            const [logsData, totalData] = await Promise.all([
                getTimerLogs(task._id),
                getTotalTime(task._id),
            ]);

            setTimerLogs(logsData.timeLogs || []);
            setTotalTime(totalData.totalDuration || 0);
        } catch (err) {
            setActionError(
                err.response?.data?.message || "Failed to load timer logs"
            );
        } finally {
            setLogsLoading(false);
        }
    };

    const formatDuration = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(seconds).padStart(2, "0")}`;
    };

    // Filter tasks
    const filteredTasks = tasks.filter((task) => {
        if (filterStatus === "All") return true;
        return task.status === filterStatus;
    });

    const activeTaskObj = tasks.find(
        (t) => t._id === (activeTimer?.task?._id || activeTimer?.task)
    ) || (activeTimer?.task?.title ? activeTimer.task : null);

    const getUserInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
            {/* Background ambient lighting */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-900/15 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                            TaskFlow
                        </span>
                    </div>

                    {/* User & Logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center">
                                {getUserInitials(user?.name)}
                            </div>
                            <span className="text-xs font-medium text-slate-300 hidden sm:inline">
                                {user?.name}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                {/* Hero / Greeting Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Welcome back, {user?.name || "User"} 👋
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Track your time, manage your workflow, and stay productive.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setFormData({ title: "", description: "" });
                            setFormError("");
                            setShowCreateModal(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        New Task
                    </button>
                </div>

                {/* Active Timer Live Banner */}
                {activeTimer && (
                    <div className="glass-panel rounded-2xl p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 animate-pulse-glow flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                                        Timer Running
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-white mt-0.5 truncate max-w-xs sm:max-w-md">
                                    {activeTaskObj?.title || "Active Task Session"}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="font-mono-timer text-2xl font-bold text-indigo-300 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-indigo-500/20 tracking-wider">
                                {formatDuration(elapsedTime)}
                            </div>

                            <button
                                onClick={() => handleStopTimer(activeTimer.task?._id || activeTimer.task)}
                                disabled={timerLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 shadow-md shadow-rose-600/20 transition disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                                {timerLoading ? "Stopping..." : "Stop Timer"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Metrics Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tasks */}
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Tasks
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-white">
                            {tasks.length}
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                            <span className="text-amber-400/90 font-medium">
                                Pending: {summary?.pendingTasks ?? tasks.filter((t) => t.status === "Pending").length}
                            </span>
                            <span>•</span>
                            <span className="text-indigo-400 font-medium">
                                In Progress: {summary?.inProgressTasks ?? tasks.filter((t) => t.status === "In Progress").length}
                            </span>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="glass-panel rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Completed
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-white">
                            {summaryLoading
                                ? "..."
                                : summary?.completedTasks ?? tasks.filter((t) => t.status === "Completed").length}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            Tasks finished
                        </p>
                    </div>

                    {/* Worked On Today */}
                    <div className="glass-panel rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Worked On Today
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 text-3xl font-extrabold text-white">
                            {summaryLoading ? "..." : summary?.tasksWorkedOn ?? 0}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            Active session tasks
                        </p>
                    </div>

                    {/* Total Time Tracked Today */}
                    <div className="glass-panel rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Tracked Today
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-3 font-mono-timer text-2xl font-extrabold text-white">
                            {summaryLoading
                                ? "..."
                                : formatDuration(summary?.totalTrackedTime || 0)}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            Accumulated session time
                        </p>
                    </div>
                </div>

                {/* Dismissable Action Error Notice */}
                {actionError && (
                    <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{actionError}</span>
                        </div>
                        <button
                            onClick={() => setActionError("")}
                            className="text-rose-400 hover:text-rose-200 transition font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Task Controls & Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/60">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Task Directory
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Showing {filteredTasks.length} of {tasks.length} total tasks
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                        {["All", "Pending", "In Progress", "Completed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterStatus === status
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                    {loading && (
                        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-sm">
                            <svg className="animate-spin h-6 w-6 text-indigo-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Loading workspace tasks...
                        </div>
                    )}

                    {error && (
                        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-sm text-rose-300">
                            {error}
                        </div>
                    )}

                    {!loading && !error && filteredTasks.length === 0 && (
                        <div className="glass-panel rounded-2xl p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-white">No tasks found</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                {filterStatus === "All"
                                    ? "Your workspace is clear. Create your first task to get started."
                                    : `There are no tasks with status "${filterStatus}".`}
                            </p>
                            {filterStatus === "All" && (
                                <button
                                    onClick={() => {
                                        setEditingTask(null);
                                        setFormData({ title: "", description: "" });
                                        setFormError("");
                                        setShowCreateModal(true);
                                    }}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
                                >
                                    + Create Task
                                </button>
                            )}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        filteredTasks.map((task) => {
                            const isCurrentTaskRunning =
                                (activeTimer?.task?._id || activeTimer?.task) === task._id;

                            return (
                                <div
                                    key={task._id}
                                    className="glass-panel-interactive rounded-2xl p-5"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Task Details */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-base font-bold text-white truncate">
                                                    {task.title}
                                                </h3>

                                                {/* Status Selector Pill */}
                                                <select
                                                    value={task.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(task._id, e.target.value)
                                                    }
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer border transition ${task.status === "Completed"
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                            : task.status === "In Progress"
                                                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                                                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                        }`}
                                                >
                                                    <option value="Pending" className="bg-slate-900 text-amber-400">
                                                        Pending
                                                    </option>
                                                    <option value="In Progress" className="bg-slate-900 text-indigo-400">
                                                        In Progress
                                                    </option>
                                                    <option value="Completed" className="bg-slate-900 text-emerald-400">
                                                        Completed
                                                    </option>
                                                </select>
                                            </div>

                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                                {task.description || "No additional details provided."}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                                            {/* Edit */}
                                            <button
                                                onClick={() => handleEditTask(task)}
                                                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                                            >
                                                Edit
                                            </button>

                                            {/* Time Logs */}
                                            <button
                                                onClick={() => handleViewLogs(task)}
                                                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
                                            >
                                                Time Logs
                                            </button>

                                            {/* Delete */}
                                            <button
                                                onClick={() => {
                                                    setDeletingTask(task);
                                                    setActionError("");
                                                    setShowDeleteModal(true);
                                                }}
                                                className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition"
                                            >
                                                Delete
                                            </button>

                                            {/* Timer Button */}
                                            {isCurrentTaskRunning ? (
                                                <button
                                                    onClick={() => handleStopTimer(task._id)}
                                                    disabled={timerLoading}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition disabled:opacity-50"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <rect x="6" y="6" width="12" height="12" rx="2" />
                                                    </svg>
                                                    {timerLoading ? "Stopping..." : "Stop Timer"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartTimer(task._id)}
                                                    disabled={timerLoading || !!activeTimer}
                                                    title={activeTimer ? "Stop current active timer first" : "Start timer"}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                    Start Timer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </main>

            {/* Create/Edit Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-modal w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    {editingTask ? "Edit Task" : "Create New Task"}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {editingTask
                                        ? "Update task parameters and description."
                                        : "Add a new task item to your workspace."}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="mt-6 space-y-4">
                            {!editingTask && (
                                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                                            ✨ AI Natural Language Assistant
                                        </span>
                                        <span className="text-[10px] text-indigo-400">e.g. "follow up with designer"</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder='Type natural language (e.g. "follow up with designer")...'
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAISuggestion();
                                                }
                                            }}
                                            className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAISuggestion}
                                            disabled={aiLoading || !aiPrompt.trim()}
                                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition shrink-0 shadow-md shadow-indigo-600/20"
                                        >
                                            {aiLoading ? "Generating..." : "✨ Auto-Fill"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Implement OAuth Authentication"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    placeholder="Add task objectives or requirements..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full resize-none rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                />
                            </div>

                            {formError && (
                                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-300">
                                    {formError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition disabled:opacity-50"
                                >
                                    {submitting
                                        ? editingTask
                                            ? "Updating..."
                                            : "Creating..."
                                        : editingTask
                                            ? "Save Changes"
                                            : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-modal w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Delete Task</h3>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-white">
                                "{deletingTask?.title}"
                            </span>
                            ? All associated time tracking logs will remain preserved.
                        </p>

                        {actionError && (
                            <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                                {actionError}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingTask(null);
                                    setActionError("");
                                }}
                                disabled={actionLoading}
                                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteTask}
                                disabled={actionLoading}
                                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition disabled:opacity-50"
                            >
                                {actionLoading ? "Deleting..." : "Confirm Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Logs Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="glass-modal w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-white">Time Tracking Logs</h3>
                                <p className="text-xs text-indigo-400 mt-0.5 font-medium truncate max-w-xs sm:max-w-sm">
                                    {selectedTask.title}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTask(null);
                                    setTimerLogs([]);
                                    setTotalTime(0);
                                }}
                                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Total Tracked Header */}
                        <div className="mt-6 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
                            <div>
                                <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                                    Total Tracked Time
                                </span>
                                <div className="font-mono-timer text-2xl font-extrabold text-white mt-0.5">
                                    {formatDuration(totalTime)}
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Session History */}
                        <div className="mt-6">
                            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-3">
                                Session Logs
                            </h4>

                            {logsLoading ? (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    Loading session logs...
                                </div>
                            ) : timerLogs.length === 0 ? (
                                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                                    No recorded sessions for this task.
                                </div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                    {timerLogs.map((log) => (
                                        <div
                                            key={log._id}
                                            className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3 flex items-center justify-between text-xs"
                                        >
                                            <div>
                                                <div className="font-medium text-slate-200">
                                                    {new Date(log.startTime).toLocaleString()}
                                                </div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">
                                                    {log.endTime
                                                        ? `Ended: ${new Date(log.endTime).toLocaleTimeString()}`
                                                        : "Session in progress"}
                                                </div>
                                            </div>
                                            <div className="font-mono-timer font-semibold text-indigo-300">
                                                {formatDuration(log.duration || 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => {
                                    setSelectedTask(null);
                                    setTimerLogs([]);
                                    setTotalTime(0);
                                }}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;