import api from "./axios";

// create page
export const createPage = (data) =>
  api.post("/page/create", data);

// get public page by username
export const getPageByUsername = (username) =>
  api.get(`/page/${username}`);
