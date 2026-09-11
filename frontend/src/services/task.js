import api from "./api";

export const getTasks = async () => {
    const response = await api.get("/tasks");

    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post("/tasks", taskData);

    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await api.put(
        `/tasks/${taskId}`,
        taskData
    );

    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await api.delete(
        `/tasks/${taskId}`
    );

    return response.data;
};

export const startTimer = async (taskId) => {
    const response = await api.post(
        `/tasks/${taskId}/timer/start`
    );

    return response.data;
};

export const stopTimer = async (taskId) => {
    const response = await api.post(
        `/tasks/${taskId}/timer/stop`
    );

    return response.data;
};

export const getTimerLogs = async (taskId) => {
    const response = await api.get(
        `/tasks/${taskId}/timer/logs`
    );

    return response.data;
};

export const getTotalTime = async (taskId) => {
    const response = await api.get(
        `/tasks/${taskId}/timer/total`
    );

    return response.data;
};