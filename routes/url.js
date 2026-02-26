// const express = require('express');
// const {handleGenerateNewShortURL,handleGetAnalytics,handleGetQRCode,handleDownloadQRCode,handleGetAllURLs} = require("../controllers/url");
// const router =express.Router();

// router.post("/",handleGenerateNewShortURL);
// router.get("/",handleGetAllURLs);
// router.get("/analytics/:shortId",handleGetAnalytics);

// router.get("/qr/:shortId", handleGetQRCode);
// router.get("/qr/:shortId/download", handleDownloadQRCode);

// module.exports=router;

const express = require("express");
const router = express.Router();
const { checkForAuthentication } = require("../middlewares/auth");

const {
  handleGenerateNewShortURL,
  handleGetAllURLs,
  handleGetAnalytics,
  handleGetQRCode,
  handleDownloadQRCode,
  handleDeleteURL,
  handleGetQRAnalytics,
} = require("../controllers/url");

// 🔐 PROTECTED (USER-SPECIFIC)
router.post("/", checkForAuthentication, handleGenerateNewShortURL);
router.get("/", checkForAuthentication, handleGetAllURLs);

// 🔐 DELETE URL (OWNER ONLY)
router.delete("/:id", checkForAuthentication, handleDeleteURL);

// 🔐 ANALYTICS (OWNER ONLY)
router.get("/analytics/:shortId", checkForAuthentication, handleGetAnalytics);

// 🔐 QR ANALYTICS (OWNER ONLY)
router.get("/qr-analytics/:id", checkForAuthentication, handleGetQRAnalytics);

// 🌍 PUBLIC
router.get("/qr/:shortId", handleGetQRCode);
router.get("/qr/:shortId/download", handleDownloadQRCode);

module.exports = router;
