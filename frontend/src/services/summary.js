import api from "./api";

export const getDailySummary = async () => {
    const response = await api.get("/summary/daily");

    return response.data;
};