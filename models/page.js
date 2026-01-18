// const mongoose = require("mongoose");

// const linkSchema = new mongoose.Schema({
//   label: {
//     type: String,
//     required: true,
//   },
//   url: {
//     type: String,
//     required: true,
//   },
//   clicks: {
//     type: Number,
//     default: 0,
//   },
// });

// const pageSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true, // shrenik
//     },
//     title: String,
//     bio: String,
//     links: [linkSchema],
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "users",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Page", pageSchema);


// const express = require("express");
// const Page = require("../models/page");

// const router = express.Router();

// /* GET MY PAGE */
// router.get("/me", async (req, res) => {
//   if (!req.user) return res.status(401).json({ error: "Unauthorized" });

//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) return res.status(404).json({ error: "No page" });

//   res.json(page);
// });

// /* CREATE PAGE */
// router.post("/create", async (req, res) => {
//   if (!req.user) return res.status(401).json({ error: "Unauthorized" });

//   const exists = await Page.findOne({ createdBy: req.user._id });
//   if (exists) {
//     return res.status(400).json({ error: "Page already exists" });
//   }

//   const page = await Page.create({
//     title: req.body.title,
//     createdBy: req.user._id,
//   });

//   res.status(201).json(page);
// });

// /* ADD LINK */
// router.post("/link", async (req, res) => {
//   if (!req.user) return res.status(401).json({ error: "Unauthorized" });

//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) return res.status(404).json({ error: "Page not found" });

//   page.links.push(req.body);
//   await page.save();

//   res.json(page);
// });

// /* DELETE LINK */
// router.delete("/link/:linkId", async (req, res) => {
//   if (!req.user) return res.status(401).json({ error: "Unauthorized" });

//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) return res.status(404).json({ error: "Page not found" });

//   page.links = page.links.filter(
//     (l) => l._id.toString() !== req.params.linkId
//   );

//   await page.save();
//   res.json(page);
// });

// module.exports = router;

const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // 🔥 ONE PAGE PER USER
    },

    links: [
      {
        label: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("page", pageSchema);
