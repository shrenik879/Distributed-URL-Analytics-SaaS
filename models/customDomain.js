const mongoose = require("mongoose");
const crypto = require("crypto");

const customDomainSchema = new mongoose.Schema(
    {
        domain: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "PENDING_APPROVAL", "VERIFIED", "REJECTED"],
            default: "PENDING",
        },
        verificationToken: {
            type: String,
            default: () => crypto.randomBytes(16).toString("hex"),
        },
        verifiedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CustomDomain", customDomainSchema);
