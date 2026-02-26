import api from "./axios";

// create short url (supports customAlias + customDomainId + QR generation)
export const createShortUrl = (url, customAlias, customDomainId, extras = {}) =>
  api.post("/url", {
    url,
    customAlias: customAlias || undefined,
    customDomainId: customDomainId || undefined,
    ...extras,
  });

// get all urls of logged-in user
export const getUserUrls = () =>
  api.get("/url");

// analytics for short links
export const getAnalytics = (shortId) =>
  api.get(`/url/analytics/${shortId}`);

// delete a url/qr by mongo id
export const deleteUrl = (id) =>
  api.delete(`/url/${id}`);

// QR analytics by mongo id
export const getQRAnalytics = (id) =>
  api.get(`/url/qr-analytics/${id}`);
