const express = require("express");
const router = express.Router();
const URL = require("../models/url");
const User = require("../models/user");

// GET /stats — public stats for landing page
router.get("/", async (req, res) => {
    try {
        const totalUrls = await URL.countDocuments();
        const totalUsers = await User.countDocuments();

        // Sum all visitHistory lengths for total clicks
        const clicksAgg = await URL.aggregate([
            { $project: { clicks: { $size: "$visitHistory" } } },
            { $group: { _id: null, total: { $sum: "$clicks" } } },
        ]);
        const totalClicks = clicksAgg.length > 0 ? clicksAgg[0].total : 0;

        res.json({ totalUrls, totalUsers, totalClicks });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ error: "Failed to load stats" });
    }
});

module.exports = router;
