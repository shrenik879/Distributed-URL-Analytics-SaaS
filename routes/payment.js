const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const { checkForAuthentication } = require("../middlewares/auth");

const router = express.Router();

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const IS_DEMO = !KEY_ID || KEY_ID.includes("REPLACE_ME") || !KEY_SECRET || KEY_SECRET.includes("REPLACE_ME");

let razorpay = null;
if (!IS_DEMO) {
    razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
}

const PLAN_PRICES = {
    CORE: 849 * 100,
    GROWTH: 2399 * 100,
    PREMIUM: 16499 * 100,
};

// POST /payment/create-order
router.post("/create-order", checkForAuthentication, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const { plan } = req.body;
        if (!PLAN_PRICES[plan]) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        // Demo mode — return fake order so Razorpay UI can open
        if (IS_DEMO) {
            return res.json({
                orderId: `demo_order_${Date.now()}`,
                amount: PLAN_PRICES[plan],
                currency: "INR",
                demo: true,
            });
        }

        const order = await razorpay.orders.create({
            amount: PLAN_PRICES[plan],
            currency: "INR",
            receipt: `plan_${plan}_${req.user._id}`,
            notes: { userId: req.user._id.toString(), plan },
        });

        res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
        console.error("Razorpay order error:", err);
        res.status(500).json({ error: "Failed to create order. Check your Razorpay keys." });
    }
});

// POST /payment/verify
router.post("/verify", checkForAuthentication, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        // Demo mode — skip signature verification, just upgrade
        if (IS_DEMO || (razorpay_order_id && razorpay_order_id.startsWith("demo_"))) {
            await User.findByIdAndUpdate(req.user._id, { plan });
            return res.json({ message: "Plan upgraded (demo mode)", plan });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed" });
        }

        await User.findByIdAndUpdate(req.user._id, { plan });
        res.json({ message: "Plan upgraded successfully", plan });
    } catch (err) {
        console.error("Payment verify error:", err);
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
