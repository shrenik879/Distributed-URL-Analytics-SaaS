const express = require("express");
const router = express.Router();
const User = require("../models/user");
const URL = require("../models/url");
const CustomDomain = require("../models/customDomain");
const { checkForAuthentication, restrictTo } = require("../middlewares/auth");

// All admin routes require ADMIN role
router.use(checkForAuthentication);
router.use(restrictTo(["ADMIN"]));

/* ═══════════════════════════════════════
   1. DASHBOARD OVERVIEW
   ═══════════════════════════════════════ */
router.get("/overview", async (req, res) => {
    try {
        const [totalUsers, totalUrls] = await Promise.all([
            User.countDocuments(),
            URL.countDocuments(),
        ]);

        // Total clicks = sum of all visitHistory lengths
        const clicksAgg = await URL.aggregate([
            { $project: { clicks: { $size: "$visitHistory" } } },
            { $group: { _id: null, total: { $sum: "$clicks" } } },
        ]);
        const totalClicks = clicksAgg[0]?.total || 0;

        // URLs created today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const urlsToday = await URL.countDocuments({ createdAt: { $gte: todayStart } });

        // Top 5 most clicked URLs
        const topUrls = await URL.aggregate([
            { $project: { shortId: 1, redirectURL: 1, createdBy: 1, clicks: { $size: "$visitHistory" }, isActive: 1, createdAt: 1 } },
            { $sort: { clicks: -1 } },
            { $limit: 5 },
        ]);

        // Recently registered users (last 10)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name email role plan status createdAt");

        res.json({ totalUsers, totalUrls, totalClicks, urlsToday, topUrls, recentUsers });
    } catch (err) {
        console.error("Admin overview error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ═══════════════════════════════════════
   2. USER MANAGEMENT
   ═══════════════════════════════════════ */

// List all users (with search/filter/pagination)
router.get("/users", async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        if (role) filter.role = role;
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select("-password"),
            User.countDocuments(filter),
        ]);

        res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Single user profile + their URLs
router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        const urls = await URL.find({ createdBy: req.params.id })
            .sort({ createdAt: -1 })
            .select("shortId redirectURL visitHistory isActive createdAt");

        const totalClicks = urls.reduce((sum, u) => sum + (u.visitHistory?.length || 0), 0);

        res.json({ user, urls, totalClicks });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Promote / Demote user role
router.put("/users/:id/role", async (req, res) => {
    try {
        const { role } = req.body;
        if (!["NORMAL", "ADMIN"].includes(role)) return res.status(400).json({ error: "Invalid role" });

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Suspend / Activate user
router.put("/users/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["ACTIVE", "SUSPENDED"].includes(status)) return res.status(400).json({ error: "Invalid status" });

        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Delete user + their URLs
router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        await URL.deleteMany({ createdBy: req.params.id });
        res.json({ message: "User and their URLs deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

/* ═══════════════════════════════════════
   3. URL MANAGEMENT
   ═══════════════════════════════════════ */

// List all URLs (with filters/pagination)
router.get("/urls", async (req, res) => {
    try {
        const { user, minClicks, from, to, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (user) filter.createdBy = user;
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        let pipeline = [
            { $match: filter },
            { $addFields: { clicks: { $size: "$visitHistory" } } },
        ];

        if (minClicks) {
            pipeline.push({ $match: { clicks: { $gte: Number(minClicks) } } });
        }

        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) },
            { $project: { shortId: 1, redirectURL: 1, clicks: 1, isActive: 1, createdBy: 1, createdAt: 1 } }
        );

        const urls = await URL.aggregate(pipeline);
        const total = await URL.countDocuments(filter);

        res.json({ urls, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Toggle URL active/inactive
router.put("/urls/:id/toggle", async (req, res) => {
    try {
        const url = await URL.findById(req.params.id);
        if (!url) return res.status(404).json({ error: "URL not found" });

        url.isActive = !url.isActive;
        await url.save();
        res.json({ isActive: url.isActive, shortId: url.shortId });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Delete URL
router.delete("/urls/:id", async (req, res) => {
    try {
        const url = await URL.findByIdAndDelete(req.params.id);
        if (!url) return res.status(404).json({ error: "URL not found" });
        res.json({ message: "URL deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

/* ═══════════════════════════════════════
   4. ANALYTICS CENTER
   ═══════════════════════════════════════ */
router.get("/analytics", async (req, res) => {
    try {
        // Clicks per day (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const clicksPerDay = await URL.aggregate([
            { $unwind: "$visitHistory" },
            { $match: { "visitHistory.timestamp": { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitHistory.timestamp" } },
                    clicks: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Clicks per week (last 12 weeks)
        const twelveWeeksAgo = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000);
        const clicksPerWeek = await URL.aggregate([
            { $unwind: "$visitHistory" },
            { $match: { "visitHistory.timestamp": { $gte: twelveWeeksAgo } } },
            {
                $group: {
                    _id: { $isoWeek: "$visitHistory.timestamp" },
                    clicks: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Top 10 performing URLs
        const topUrls = await URL.aggregate([
            { $project: { shortId: 1, redirectURL: 1, clicks: { $size: "$visitHistory" }, createdAt: 1 } },
            { $sort: { clicks: -1 } },
            { $limit: 10 },
        ]);

        // Most active users (by URL count)
        const activeUsers = await URL.aggregate([
            { $group: { _id: "$createdBy", urlCount: { $sum: 1 }, totalClicks: { $sum: { $size: "$visitHistory" } } } },
            { $sort: { totalClicks: -1 } },
            { $limit: 10 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $project: { urlCount: 1, totalClicks: 1, "user.name": 1, "user.email": 1 } },
        ]);

        // Platform growth (new users per day, last 30 days)
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({ clicksPerDay, clicksPerWeek, topUrls, activeUsers, userGrowth });
    } catch (err) {
        console.error("Admin analytics error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ═══════════════════════════════════════
   5. ABUSE & MODERATION
   ═══════════════════════════════════════ */
router.get("/abuse", async (req, res) => {
    try {
        // Suspicious high-click URLs (more than 100 clicks)
        const suspicious = await URL.aggregate([
            { $project: { shortId: 1, redirectURL: 1, clicks: { $size: "$visitHistory" }, isActive: 1, createdBy: 1, createdAt: 1 } },
            { $match: { clicks: { $gte: 50 } } },
            { $sort: { clicks: -1 } },
            { $limit: 20 },
        ]);

        // Disabled URLs
        const disabled = await URL.find({ isActive: false })
            .sort({ updatedAt: -1 })
            .limit(20)
            .select("shortId redirectURL isActive createdBy createdAt");

        // Suspended users
        const suspendedUsers = await User.find({ status: "SUSPENDED" })
            .select("name email status createdAt");

        res.json({ suspicious, disabled, suspendedUsers });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

/* ═══════════════════════════════════════
   6. DOMAIN MANAGEMENT
   ═══════════════════════════════════════ */

// List all domains (with filters)
router.get("/domains", async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const domains = await CustomDomain.find(filter)
            .sort({ createdAt: -1 })
            .populate("user", "name email");

        res.json({ domains });
    } catch (err) {
        console.error("Admin domains error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Approve domain
router.put("/domains/:id/approve", async (req, res) => {
    try {
        const domain = await CustomDomain.findById(req.params.id);
        if (!domain) return res.status(404).json({ error: "Domain not found" });

        domain.status = "VERIFIED";
        domain.verifiedAt = new Date();
        await domain.save();

        res.json({ message: "Domain approved", domain });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Reject domain
router.put("/domains/:id/reject", async (req, res) => {
    try {
        const domain = await CustomDomain.findById(req.params.id);
        if (!domain) return res.status(404).json({ error: "Domain not found" });

        domain.status = "REJECTED";
        await domain.save();

        res.json({ message: "Domain rejected", domain });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Delete domain (admin)
router.delete("/domains/:id", async (req, res) => {
    try {
        const domain = await CustomDomain.findByIdAndDelete(req.params.id);
        if (!domain) return res.status(404).json({ error: "Domain not found" });
        res.json({ message: "Domain deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
