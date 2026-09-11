import { Navigate, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/signup"
                element={<Signup />}
            />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
            </Route>
        </Routes>
    );
}

export default App;