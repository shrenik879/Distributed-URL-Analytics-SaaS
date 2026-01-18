import api from "./axios";

// create short url (🔥 UPDATED: supports customAlias)
export const createShortUrl = (url, customAlias) =>
  api.post("/url", {
    url,
    customAlias: customAlias || undefined,
  });

// get all urls of logged-in user
export const getUserUrls = () =>
  api.get("/url");

// analytics
export const getAnalytics = (shortId) =>
  api.get(`/url/analytics/${shortId}`);
