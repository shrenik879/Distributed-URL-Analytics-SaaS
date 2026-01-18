import api from "./axios";

// get analytics for a shortId
export const getAnalytics = (shortId) => {
  return api.get(`/url/analytics/${shortId}`);
};
