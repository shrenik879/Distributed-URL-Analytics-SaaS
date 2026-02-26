const shortid = require("shortid");
const URL = require("../models/url");
const User = require("../models/user");
const CustomDomain = require("../models/customDomain");
const QRCode = require("qrcode");

// Plan-based link limits
const PLAN_LIMITS = {
  FREE: 5,
  CORE: 100,
  GROWTH: 500,
  PREMIUM: 3000,
};

// Plan-based QR code limits
const QR_LIMITS = {
  FREE: 2,
  CORE: 5,
  GROWTH: 10,
  PREMIUM: 200,
};

// Plans that allow custom aliases
const ALIAS_ALLOWED_PLANS = ["CORE", "GROWTH", "PREMIUM"];

async function handleGenerateNewShortURL(req, res) {
  try {
    const { url, customAlias, customDomainId, withQR, title, qrColor } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Plan limit enforcement (total-ever-created, never decremented)
    const user = await User.findById(req.user._id);
    const plan = user?.plan || "FREE";
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;

    // Backfill counter for legacy users
    let totalLinks = user.totalLinksCreated || 0;
    if (totalLinks === 0) {
      totalLinks = await URL.countDocuments({ createdBy: req.user._id });
      if (totalLinks > 0) {
        await User.findByIdAndUpdate(req.user._id, { totalLinksCreated: totalLinks });
      }
    }

    if (totalLinks >= limit) {
      return res.status(403).json({
        error: `You've reached the ${plan} plan limit of ${limit} links. Upgrade your plan to create more.`,
        limitReached: true,
        currentPlan: plan,
        limit,
        used: totalLinks,
      });
    }

    // QR limit check (when generating from QR section)
    if (withQR) {
      const qrLimit = QR_LIMITS[plan] || QR_LIMITS.FREE;
      // Backfill QR counter for legacy users
      let totalQR = user.totalQRCodesCreated || 0;
      if (totalQR === 0) {
        totalQR = await URL.countDocuments({ createdBy: req.user._id, isQRCode: true });
        if (totalQR > 0) {
          await User.findByIdAndUpdate(req.user._id, { totalQRCodesCreated: totalQR });
        }
      }
      if (totalQR >= qrLimit) {
        return res.status(403).json({
          error: `You've reached the ${plan} plan QR limit of ${qrLimit}. Upgrade to create more.`,
          limitReached: true,
          qrLimitReached: true,
          currentPlan: plan,
          limit: qrLimit,
          used: totalQR,
        });
      }
    }

    // Custom alias check
    if (customAlias?.trim() && !ALIAS_ALLOWED_PLANS.includes(plan)) {
      return res.status(403).json({
        error: "Custom aliases are not available on the Free plan. Upgrade to Core or higher.",
        limitReached: true,
        currentPlan: plan,
      });
    }

    // Decide shortId
    const shortId = customAlias?.trim()
      ? customAlias.trim()
      : shortid.generate();

    // CHECK DUPLICATE
    const exists = await URL.findOne({ shortId });
    if (exists) {
      return res.status(400).json({ error: "Custom alias already exists" });
    }

    // Custom domain validation
    let domainRef = null;
    let shortUrl = `${process.env.BASE_URL}/url/${shortId}`;

    if (customDomainId) {
      const domain = await CustomDomain.findById(customDomainId);
      if (!domain) {
        return res.status(404).json({ error: "Custom domain not found" });
      }
      if (domain.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "This domain doesn't belong to you" });
      }
      if (domain.status !== "VERIFIED") {
        return res.status(400).json({ error: "Domain is not verified yet" });
      }
      domainRef = domain._id;
      shortUrl = `https://${domain.domain}/${shortId}`;
    }

    // Generate QR code server-side if requested
    let qrDataUrl = null;
    if (withQR) {
      qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: qrColor || "#0B1736",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
    }

    const entry = await URL.create({
      shortId,
      redirectURL: url,
      visitHistory: [],
      createdBy: req.user._id,
      customDomain: domainRef,
      qrCode: qrDataUrl,
      title: title || null,
      qrColor: qrColor || "#0B1736",
      isQRCode: withQR ? true : false,
    });

    // Increment total-ever-created counters (never decremented on delete)
    const incFields = { totalLinksCreated: 1 };
    if (withQR) incFields.totalQRCodesCreated = 1;
    await User.findByIdAndUpdate(req.user._id, { $inc: incFields });

    return res.status(201).json({
      shortId: entry.shortId,
      shortUrl,
      qrCode: qrDataUrl,
      title: entry.title,
    });

  } catch (err) {
    console.error("Create URL error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
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
  try {
    const { shortId } = req.params;

    // 1. Find the URL record first
    const url = await URL.findOne({ shortId });
    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    // 2. Auth check
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 3. Owner check
    if (url.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 4. QR check
    if (!url.qrCode) {
      return res.status(404).json({ error: "QR code not available" });
    }

    return res.json({ shortId: url.shortId, qrCode: url.qrCode });
  } catch (err) {
    console.error("QR code error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
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
    createdBy: req.user._id,
  }).populate("customDomain");

  // Return total-ever-created counters for frontend limit enforcement
  const user = await User.findById(req.user._id);
  let totalLinksCreated = user.totalLinksCreated || 0;
  let totalQRCodesCreated = user.totalQRCodesCreated || 0;

  // Backfill for legacy users
  if (totalLinksCreated === 0 && urls.length > 0) {
    totalLinksCreated = urls.length;
    await User.findByIdAndUpdate(req.user._id, { totalLinksCreated });
  }
  if (totalQRCodesCreated === 0) {
    const qrCount = urls.filter(u => u.isQRCode).length;
    if (qrCount > 0) {
      totalQRCodesCreated = qrCount;
      await User.findByIdAndUpdate(req.user._id, { totalQRCodesCreated });
    }
  }

  return res.json({ urls, totalLinksCreated, totalQRCodesCreated });
}



async function handleDeleteURL(req, res) {
  try {
    const { id } = req.params;
    const url = await URL.findById(id);
    if (!url) return res.status(404).json({ error: "URL not found" });
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (url.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Forbidden" });
    await URL.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete URL error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetQRAnalytics(req, res) {
  try {
    const { id } = req.params;
    const url = await URL.findById(id);
    if (!url) return res.status(404).json({ error: "QR not found" });
    if (!req.user || url.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ error: "Forbidden" });

    const totalScans = url.visitHistory.length;
    const clicksPerDay = {};
    url.visitHistory.forEach((v) => {
      const day = new Date(v.timestamp).toISOString().split("T")[0];
      clicksPerDay[day] = (clicksPerDay[day] || 0) + 1;
    });

    return res.json({
      title: url.title,
      redirectURL: url.redirectURL,
      qrCode: url.qrCode,
      qrColor: url.qrColor,
      shortId: url.shortId,
      createdAt: url.createdAt,
      totalScans,
      clicksPerDay,
    });
  } catch (err) {
    console.error("QR Analytics error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleGetQRCode,
  handleDownloadQRCode,
  handleGetAllURLs,
  handleDeleteURL,
  handleGetQRAnalytics,
};
