import { useEffect } from "react";
import api from "../services/api";

const Dashboard = () => {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await api.get("/health");

        console.log(response.data);
      } catch (error) {
        console.error("Backend connection failed:", error);
      }
    };

    testBackend();
  }, []);

  return <h1>Dashboard Page</h1>;
};

export default Dashboard;