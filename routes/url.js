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
} = require("../controllers/url");

// 🔐 PROTECTED (USER-SPECIFIC)
router.post("/", checkForAuthentication, handleGenerateNewShortURL);
router.get("/", checkForAuthentication, handleGetAllURLs);

// 🔐 ANALYTICS (OWNER ONLY)
router.get("/analytics/:shortId", checkForAuthentication, handleGetAnalytics);

// 🌍 PUBLIC
router.get("/qr/:shortId", handleGetQRCode);
router.get("/qr/:shortId/download", handleDownloadQRCode);

module.exports = router;
