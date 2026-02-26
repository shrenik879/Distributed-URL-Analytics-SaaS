const express = require("express");
const CustomDomain = require("../models/customDomain");
const User = require("../models/user");
const router = express.Router();

// ─── Domain limits per plan ───
const DOMAIN_LIMITS = {
    FREE: 0,
    CORE: 0,
    GROWTH: 3,
    PREMIUM: 10,
};

// ─── Auth guard helper ───
function requireAuth(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return false;
    }
    return true;
}

// ─── POST /domain/add — Add a new custom domain ───
router.post("/add", async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        // Check plan limits
        const user = await User.findById(req.user._id);
        const plan = user?.plan || "FREE";
        const limit = DOMAIN_LIMITS[plan] ?? DOMAIN_LIMITS.FREE;
        const currentCount = await CustomDomain.countDocuments({ user: req.user._id });

        if (currentCount >= limit) {
            return res.status(403).json({
                error: `Your ${plan} plan allows ${limit} custom domain${limit !== 1 ? "s" : ""}. Upgrade to add more.`,
                limitReached: true,
                currentPlan: plan,
                limit,
                used: currentCount,
            });
        }

        let { domain } = req.body;
        if (!domain || !domain.trim()) {
            return res.status(400).json({ error: "Domain is required" });
        }

        // Clean domain: remove protocol, www, trailing slashes
        domain = domain
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/+$/, "");

        // Basic validation
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(domain)) {
            return res.status(400).json({ error: "Invalid domain format" });
        }

        // Check if already taken
        const existing = await CustomDomain.findOne({ domain });
        if (existing) {
            if (existing.user.toString() === req.user._id.toString()) {
                return res.status(400).json({ error: "You already added this domain" });
            }
            return res.status(409).json({ error: "Domain already registered by another user" });
        }

        const record = await CustomDomain.create({
            domain,
            user: req.user._id,
        });

        return res.status(201).json({
            _id: record._id,
            domain: record.domain,
            status: record.status,
            verificationToken: record.verificationToken,
            createdAt: record.createdAt,
        });
    } catch (err) {
        console.error("Domain add error:", err);
        return res.status(500).json({ error: "Failed to add domain" });
    }
});

// ─── POST /domain/verify/:id — Submit for admin approval ───
router.post("/verify/:id", async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const record = await CustomDomain.findById(req.params.id);
        if (!record) return res.status(404).json({ error: "Domain not found" });
        if (record.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden" });
        }

        if (record.status === "VERIFIED") {
            return res.json({ status: "VERIFIED", message: "Domain is already verified!" });
        }

        // Set to PENDING_APPROVAL — admin will approve/reject
        record.status = "PENDING_APPROVAL";
        await record.save();

        return res.json({
            status: "PENDING_APPROVAL",
            message: "Domain submitted for admin approval. You'll be notified once approved.",
        });
    } catch (err) {
        console.error("Domain verify error:", err);
        return res.status(500).json({ error: "Verification failed" });
    }
});

// ─── GET /domain/my — List user's domains ───
router.get("/my", async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const domains = await CustomDomain.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json({ domains });
    } catch (err) {
        console.error("Domain list error:", err);
        return res.status(500).json({ error: "Failed to fetch domains" });
    }
});

// ─── DELETE /domain/:id — Remove a domain ───
router.delete("/:id", async (req, res) => {
    if (!requireAuth(req, res)) return;
    try {
        const record = await CustomDomain.findById(req.params.id);
        if (!record) return res.status(404).json({ error: "Domain not found" });
        if (record.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden" });
        }
        await CustomDomain.findByIdAndDelete(req.params.id);
        return res.json({ message: "Domain removed" });
    } catch (err) {
        console.error("Domain delete error:", err);
        return res.status(500).json({ error: "Failed to delete domain" });
    }
});

// ─── POST /domain/suggest — AI domain suggestions ───
router.post("/suggest", async (req, res) => {
    try {
        const { description } = req.body;
        if (!description || !description.trim()) {
            return res.status(400).json({ error: "Description is required" });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "REPLACE_ME") {
            const words = description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            const base = words.slice(0, 2).join("") || "mybrand";
            return res.json({
                suggestions: [
                    `${base}.link`,
                    `${base}.co`,
                    `${base}.io`,
                    `go${base}.com`,
                    `${base}hub.co`,
                ],
            });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Suggest 5 short, brandable domain names for: "${description}". Return ONLY a JSON array of strings like ["example.com","brand.io"]. No explanation.` }] }],
                }),
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const match = text.match(/\[[\s\S]*?\]/);
        const suggestions = match ? JSON.parse(match[0]) : [];
        res.json({ suggestions });
    } catch (err) {
        console.error("Domain suggest error:", err);
        res.status(500).json({ error: "Failed to generate suggestions" });
    }
});

module.exports = router;
