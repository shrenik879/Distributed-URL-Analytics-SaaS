const shortid = require("shortid");
const URL = require("../models/url");
const QRCode=require("qrcode");
// async function handleGenerateNewShortURL(req, res) {
//   const { url, customAlias } = req.body;

//   // 1️⃣ Validate URL
//   if (!url) {
//     return res.status(400).json({ error: "url is required" });
//   }

//   let shortId;

//   // 2️⃣ Check if user provided custom alias
//   if (customAlias) {
//     // 3️⃣ Check if alias already exists
//     const existing = await URL.findOne({ shortId: customAlias });

//     if (existing) {
//       return res.status(409).json({
//         error: "Custom alias already in use",
//       });
//     }

//     // 4️⃣ Use alias
//     shortId = customAlias;
//   } else {
//     // 5️⃣ Generate random ID
//     shortId = shortid();
//   }

//   // 6️⃣ Build short URL
//   const shortUrl = `http://localhost:8002/url/${shortId}`;
  
//   // 7️⃣ Generate QR
//   const qrCode = await QRCode.toDataURL(shortUrl);
  

//   // 8️⃣ Save to DB
//   const newUrl = await URL.create({
//     shortId,
//     redirectURL: url,
//     qrCode,
//     visitHistory: [],
//     createdBy: req.user?._id || null,
//   });
  
//    console.log("POST /url HIT", req.body);

//   // 9️⃣ Respond
//   return res.status(201).json({
//     shortId: newUrl.shortId,
//     shortUrl,
//     qrCode: newUrl.qrCode,
//   });
// }


async function handleGenerateNewShortURL(req, res) {
  try {
    const { url, customAlias } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // 🔹 Decide shortId
    const shortId = customAlias?.trim()
      ? customAlias.trim()
      : shortid.generate();

    // 🔐 CHECK DUPLICATE
    const exists = await URL.findOne({ shortId });
    if (exists) {
      return res.status(400).json({
        error: "Custom alias already exists",
      });
    }

    const entry = await URL.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      shortId: entry.shortId,
      shortUrl: `${process.env.VITE_BACKEND_URL}/url/${entry.shortId}`,
    });

  } catch (err) {
    console.error("Create URL error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// async function handleGetAnalytics(req, res) {
//   const { shortId } = req.params;

//  // 🔐 OWNER CHECK
// if (url.createdBy.toString() !== req.user._id.toString()) {
//   return res.status(403).json({ error: "Forbidden" });
// }


//   if (!url) {
//     return res.status(404).json({ error: "Short URL not found" });
//   }

//   const totalClicks = url.visitHistory.length;

//   const firstClicked = url.visitHistory[0]?.timestamp || null;
//   const lastClicked =
//     url.visitHistory[totalClicks - 1]?.timestamp || null;

//   const clicksPerDay = {};

//   url.visitHistory.forEach((visit) => {
//     const date = visit.timestamp.toISOString().split("T")[0];
//     clicksPerDay[date] = (clicksPerDay[date] || 0) + 1;
//   });

//   return res.json({
//     shortId,
//     redirectURL: url.redirectURL,
//     totalClicks,
//     firstClicked,
//     lastClicked,
//     clicksPerDay,
//   });
// }
async function handleGetAnalytics(req, res) {
  try {
    const { shortId } = req.params;

    // 1️⃣ Find URL first
    const url = await URL.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // 2️⃣ Auth check
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 3️⃣ Owner check
    if (url.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 4️⃣ Analytics calculation
    const totalClicks = url.visitHistory.length;

    const firstClicked = url.visitHistory[0]?.timestamp || null;
    const lastClicked =
      url.visitHistory[totalClicks - 1]?.timestamp || null;

    const clicksPerDay = {};

    url.visitHistory.forEach((visit) => {
      const date = visit.timestamp.toISOString().split("T")[0];
      clicksPerDay[date] = (clicksPerDay[date] || 0) + 1;
    });

    // 5️⃣ Response
    return res.json({
      shortId,
      redirectURL: url.redirectURL,
      totalClicks,
      firstClicked,
      lastClicked,
      clicksPerDay,
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
async function handleGetQRCode(req, res) {
  const { shortId } = req.params;

  // 🔐 OWNER CHECK
if (url.createdBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({ error: "Forbidden" });
}


  if (!url) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  if (!url.qrCode) {
    return res.status(404).json({ error: "QR code not available" });
  }

  return res.json({
    shortId: url.shortId,
    qrCode: url.qrCode,
  });
}
// async function handleDownloadQRCode(req, res) {
//   const { shortId } = req.params;

//  // 🔐 OWNER CHECK
// if (url.createdBy.toString() !== req.user._id.toString()) {
//   return res.status(403).json({ error: "Forbidden" });
// }

//   if (!url || !url.qrCode) {
//     return res.status(404).json({ error: "QR code not found" });
//   }

//   // Extract base64 data (remove prefix)
//   const base64Data = url.qrCode.replace(/^data:image\/png;base64,/, "");
//   const imageBuffer = Buffer.from(base64Data, "base64");

//   // Set headers for download
//   res.setHeader("Content-Type", "image/png");
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename="qr-${shortId}.png"`
//   );

//   return res.send(imageBuffer);
// }
async function handleDownloadQRCode(req, res) {
  const { shortId } = req.params;

  // ✅ 1. FIND URL FIRST (THIS WAS MISSING)
  const url = await URL.findOne({ shortId });

  if (!url) {
    return res.status(404).json({ error: "QR code not found" });
  }

  // ✅ 2. OWNER CHECK (NOW url EXISTS)
  if (url.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // ✅ 3. EXTRACT BASE64
  const base64Data = url.qrCode.replace(
    /^data:image\/png;base64,/,
    ""
  );
  const imageBuffer = Buffer.from(base64Data, "base64");

  // ✅ 4. SEND FILE
  res.setHeader("Content-Type", "image/png");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="qr-${shortId}.png"`
  );

  return res.send(imageBuffer);
}

// async function handleGetAllURLs(req, res) {
//   try {
//     const urls = await URL.find({ createdBy: req.user?._id || null })
//       .sort({ createdAt: -1 });

//     return res.json({
//       urls,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to fetch URLs" });
//   }
// }
async function handleGetAllURLs(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const urls = await URL.find({
    createdBy: req.user._id, // 🔥 THIS IS THE FIX
  });

  return res.json({ urls });
}


module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleGetQRCode,
  handleDownloadQRCode,
    handleGetAllURLs,
};
