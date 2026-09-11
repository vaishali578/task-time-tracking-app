import authStore from "../store/authStore";

const Dashboard = () => {
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

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

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Tasks
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              8
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tasks created
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              3
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Tasks completed
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Time Tracked
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              2h 35m
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Today's tracked time
            </p>
          </div>

        </div>

        {/* Tasks Header */}
        <div className="mt-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              My Tasks
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage your tasks and track your time.
            </p>
          </div>

          <button
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + New Task
          </button>
        </div>

        {/* Task List */}
        <div className="mt-5 space-y-4">

          {/* Task Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">
                    Build authentication API
                  </h4>

                  <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                    In Progress
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Implement JWT authentication and protected routes.
                </p>
              </div>

              <button
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                ▶ Start Timer
              </button>

            </div>

          </div>

          {/* Second Task */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">
                    Create dashboard UI
                  </h4>

                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    Completed
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  Build the main task tracking dashboard.
                </p>
              </div>

              <span className="text-sm font-medium text-gray-400">
                Completed
              </span>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;