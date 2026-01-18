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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    }
 
  },
  { timestamps: true } // Auto-add createdAt & updatedAt fields
);

const URL = mongoose.model("URL", urlSchema); // Model name should be "URL"

module.exports = URL;
