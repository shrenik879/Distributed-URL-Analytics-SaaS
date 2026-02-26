const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitHistory: [
      {
        timestamp: {
          type: Date, // Change from Number to Date
          default: Date.now, // Automatically set timestamp
        },
      },
    ],
    qrCode: String,
    title: { type: String, default: null },
    qrColor: { type: String, default: "#0B1736" },
    isQRCode: { type: Boolean, default: false },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    customDomain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomDomain",
      default: null,
    }

  },
  { timestamps: true } // Auto-add createdAt & updatedAt fields
);

const URL = mongoose.model("URL", urlSchema); // Model name should be "URL"

module.exports = URL;
