const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, default: "NORMAL" },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    plan: { type: String, enum: ["FREE", "CORE", "GROWTH", "PREMIUM"], default: "FREE" },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
    pagesCreatedCount: { type: Number, default: 0 }, // tracks total pages ever created (history-based limit for FREE)
    totalLinksCreated: { type: Number, default: 0 }, // tracks total links ever created (never decremented on delete)
    totalQRCodesCreated: { type: Number, default: 0 }, // tracks total QR codes ever created (never decremented on delete)
}, { timestamps: true });

const User = mongoose.model('user', userSchema);

module.exports = User;