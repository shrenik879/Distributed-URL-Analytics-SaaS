import api from "./axios";

export const addDomain = (domain) => api.post("/domain/add", { domain });
export const verifyDomain = (id) => api.post(`/domain/verify/${id}`);
export const getMyDomains = () => api.get("/domain/my");
export const deleteDomain = (id) => api.delete(`/domain/${id}`);
