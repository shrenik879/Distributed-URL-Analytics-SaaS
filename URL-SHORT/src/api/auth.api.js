import api from "./axios";

export const signupUser = (data) => api.post("/user", data);
export const loginUser = (data) => api.post("/user/login", data);
