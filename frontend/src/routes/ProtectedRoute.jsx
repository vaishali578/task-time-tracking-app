import { Navigate, Outlet } from "react-router-dom";
import authStore from "../store/authStore";

const ProtectedRoute = () => {
  const token = authStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;