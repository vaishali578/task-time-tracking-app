import { useEffect, useState } from "react";
import authStore from "../store/authStore";
import {
    getTasks,
    createTask,
} from "../services/task";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const [formError, setFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);

    const handleLogout = () => {
        logout();
    };

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getTasks();

            setTasks(data.tasks);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load tasks"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Handle form input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Create task
    const handleCreateTask = async (e) => {
        e.preventDefault();

        setFormError("");

        if (!formData.title.trim()) {
            setFormError("Task title is required");
            return;
        }

        if (formData.title.trim().length > 200) {
            setFormError(
                "Task title cannot exceed 200 characters"
            );
            return;
        }

        if (formData.description.length > 2000) {
            setFormError(
                "Description cannot exceed 2000 characters"
            );
            return;
        }

        try {
            setSubmitting(true);

            await createTask({
                title: formData.title.trim(),
                description: formData.description.trim(),
            });

            // Refresh task list
            await fetchTasks();

            // Reset form
            setFormData({
                title: "",
                description: "",
            });

            setShowCreateModal(false);
        } catch (error) {
            setFormError(
                error.response?.data?.message ||
                "Failed to create task"
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Close modal
    const handleCloseModal = () => {
        if (submitting) return;

        setShowCreateModal(false);

        setFormData({
            title: "",
            description: "",
        });

        setFormError("");
    };

    // Summary
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    <h1 className="text-xl font-bold text-gray-900">
                        TaskFlow
                    </h1>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            {user?.name}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Welcome */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Good morning, {user?.name} 👋
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Here's what's happening with your tasks today.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Total Tasks */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Total Tasks
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {totalTasks}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Tasks created
                        </p>
                    </div>

                    {/* Completed */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Completed
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {completedTasks}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Tasks completed
                        </p>
                    </div>

                    {/* Time Tracked */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-500">
                            Time Tracked
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            0h 0m
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Today's tracked time
                        </p>
                    </div>

                </div>

                {/* Tasks Header */}
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                            My Tasks
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage your tasks and track your time.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        + New Task
                    </button>

                </div>

                {/* Task List */}
                <div className="mt-5 space-y-4">

                    {/* Loading */}
                    {loading && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <p className="text-sm text-gray-500">
                                Loading tasks...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading &&
                        !error &&
                        tasks.length === 0 && (
                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">

                                <h4 className="font-semibold text-gray-900">
                                    No tasks yet
                                </h4>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create your first task to get started.
                                </p>

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Create Task
                                </button>

                            </div>
                        )}

                    {/* Real Tasks */}
                    {!loading &&
                        !error &&
                        tasks.map((task) => (
                            <div
                                key={task._id}
                                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">

                                            <h4 className="font-semibold text-gray-900">
                                                {task.title}
                                            </h4>

                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    task.status === "Completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : task.status === "In Progress"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {task.status}
                                            </span>

                                        </div>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {task.description ||
                                                "No description"}
                                        </p>
                                    </div>

                                    <button
                                        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                                    >
                                        ▶ Start Timer
                                    </button>

                                </div>
                            </div>
                        ))}

                </div>

            </main>

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Create New Task
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Add a task to your workspace.
                                </p>
                            </div>

                            <button
                                onClick={handleCloseModal}
                                className="text-xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleCreateTask}
                            className="mt-6 space-y-5"
                        >

                            {/* Title */}
                            <div>
                                <label
                                    htmlFor="title"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Task Title
                                </label>

                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    placeholder="e.g. Build authentication API"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Describe what needs to be done..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            {/* Error */}
                            {formError && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Creating..."
                                        : "Create Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Dashboard;