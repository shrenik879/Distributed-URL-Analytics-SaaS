import api from "./axios";

// get QR code image (base64)
export const getQRCode = (shortId) => {
  return api.get(`/url/qr/${shortId}`);
};

// download QR code
export const downloadQRCode = (shortId) => {
  return api.get(`/url/qr/${shortId}/download`, {
    responseType: "blob",
  });
};
