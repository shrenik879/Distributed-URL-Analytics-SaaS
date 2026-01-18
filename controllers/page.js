// const Page = require("../models/page");

// // async function handleCreatePage(req, res) {
// //   try {
// //     const { username, title, bio } = req.body;

// //     if (!username || !title) {
// //       return res.status(400).json({
// //         error: "username and title are required"
// //       });
// //     }

// //     // ✅ PREVENT DUPLICATE USERNAME
// //     const existing = await Page.findOne({ username });
// //     if (existing) {
// //       return res.status(409).json({
// //         error: "Page already exists",
// //         pageUrl: `/page/${username}`
// //       });
// //     }

// //     const page = await Page.create({
// //       username,
// //       title,
// //       bio,
// //       links: [],
// //       createdBy: req.user?._id || null
// //     });

// //     return res.status(201).json({
// //       message: "Page created successfully",
// //       pageUrl: `/page/${page.username}`
// //     });

// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ error: "Server error" });
// //   }
// // }



// async function handleCreatePage(req, res) {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { title } = req.body;
//   if (!title) {
//     return res.status(400).json({ error: "Title required" });
//   }

//   const existingPage = await Page.findOne({
//     createdBy: req.user._id,
//   });

//   if (existingPage) {
//     return res.status(400).json({ error: "Page already exists" });
//   }

//   const page = await Page.create({
//     title,
//     createdBy: req.user._id,
//   });

//   return res.status(201).json(page);
// }
// // async function handleAddLink(req, res) {
// //   if (!req.user) {
// //     return res.status(401).json({ error: "Unauthorized" });
// //   }

// //   const { label, url } = req.body;
// //   if (!label || !url) {
// //     return res.status(400).json({ error: "Label and URL required" });
// //   }

// //   const page = await Page.findOne({
// //     createdBy: req.user._id,
// //   });

// //   if (!page) {
// //     return res.status(404).json({ error: "Page not found" });
// //   }

// //   page.links.push({ label, url });
// //   await page.save();

// //   return res.status(201).json(page);
// // }

// async function handleAddLink(req, res) {
//   const { username } = req.params;
//   const { label, url } = req.body;

//   const page = await Page.findOne({ username });

//   if (!page) {
//     return res.status(404).json({ error: "Page not found" });
//   }

//   page.links.push({ label, url });
//   await page.save();

//   return res.json(page);
// }

// async function handleGetPublicPage(req, res) {
//   try {
//     const { username } = req.params;

//     const page = await Page.findOne({ username });

//     if (!page) {
//       return res.status(404).json({ error: "Page not found" });
//     }

//     // Return only what frontend needs
//     return res.json({
//       username: page.username,
//       title: page.title,
//       bio: page.bio,
//       links: page.links.map(link => ({
//         _id: link._id,
//         label: link.label,
//         url: link.url,
//         clicks: link.clicks,
//       })),
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// }
// // async function handleGetPublicPage(req, res) {
// //   const { pageId } = req.params;

// //   const page = await Page.findById(pageId);
// //   if (!page) {
// //     return res.status(404).json({ error: "Page not found" });
// //   }

// //   return res.json({
// //     title: page.title,
// //     links: page.links,
// //   });
// // }


// module.exports = {
//   handleCreatePage,
//   handleAddLink,
//   handleGetPublicPage
// };


// const Page = require("../models/page");
// const mongoose = require("mongoose");

// /* ================= CREATE PAGE ================= */
// async function handleCreatePage(req, res) {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { title } = req.body;
//   if (!title) {
//     return res.status(400).json({ error: "Title required" });
//   }

//   const existingPage = await Page.findOne({ createdBy: req.user._id });
//   if (existingPage) {
//     return res.status(400).json({ error: "Page already exists" });
//   }

//   const page = await Page.create({
//     title,
//     createdBy: req.user._id,
//     links: [],
//   });

//   return res.status(201).json(page);
// }

// /* ================= ADD LINK ================= */
// // async function handleAddLink(req, res) {
// //   if (!req.user) {
// //     return res.status(401).json({ error: "Unauthorized" });
// //   }

// //   const { label, url } = req.body;
// //   if (!label || !url) {
// //     return res.status(400).json({ error: "Label and URL required" });
// //   }

// //   const page = await Page.findOne({ createdBy: req.user._id });
// //   if (!page) {
// //     return res.status(404).json({ error: "Page not found" });
// //   }

// //   page.links.push({ label, url });
// //   await page.save();

// //   return res.json(page);
// // }

// async function handleAddLink(req, res) {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const { label, url } = req.body;
//   if (!label || !url) {
//     return res.status(400).json({ error: "Label and URL required" });
//   }

//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) {
//     return res.status(404).json({ error: "Page not found" });
//   }

//   page.links.push({ label, url });
//   await page.save();

//   return res.json(page);
// }


// /* ================= GET MY PAGE ================= */
// async function handleGetMyPage(req, res) {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) return res.status(404).json(null);

//   return res.json(page);
// }

// /* ================= PUBLIC PAGE ================= */
// // async function handleGetPublicPage(req, res) {
// //   const { pageId } = req.params;

// //   const page = await Page.findById(pageId);
// //   if (!page) {
// //     return res.status(404).json({ error: "Page not found" });
// //   }

// //   return res.json({
// //     _id: page._id,
// //     title: page.title,
// //     links: page.links,
// //   });
// // }



// // async function handleGetPublicPage(req, res) {
// //   try {
// //     const { pageId } = req.params;

// //     // 🔐 Prevent crash
// //     if (!mongoose.Types.ObjectId.isValid(pageId)) {
// //       return res.status(400).json({ error: "Invalid page id" });
// //     }

// //     const page = await Page.findById(pageId);

// //     if (!page) {
// //       return res.status(404).json({ error: "Page not found" });
// //     }

// //     return res.json({
// //       pageId: page._id,
// //       title: page.title,
// //       links: page.links,
// //     });
// //   } catch (err) {
// //     console.error("Get public page error:", err);
// //     return res.status(500).json({ error: "Server error" });
// //   }
// // }
// // async function handleGetPublicPage(req, res) {
// //   const { pageId } = req.params;

// //   // ✅ Validate ObjectId
// //   if (!mongoose.Types.ObjectId.isValid(pageId)) {
// //     return res.status(400).json({ error: "Invalid page id" });
// //   }

// //   const page = await Page.findById(pageId);
// //   if (!page) {
// //     return res.status(404).json({ error: "Page not found" });
// //   }

// //   return res.json({
// //     title: page.title,
// //     links: page.links,
// //   });
// // }


// module.exports = {
//   handleCreatePage,
//   handleAddLink,
//   handleGetMyPage,
//   handleGetPublicPage,
// };








const Page = require("../models/page");

// CREATE PAGE
async function handleCreatePage(req, res) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const exists = await Page.findOne({ createdBy: req.user._id });
  if (exists) return res.status(400).json({ error: "Page already exists" });

  const page = await Page.create({
    title: req.body.title,
    createdBy: req.user._id,
  });

  res.status(201).json(page);
}

// ADD LINK
async function handleAddLink(req, res) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const page = await Page.findOne({ createdBy: req.user._id });
  if (!page) return res.status(404).json({ error: "Page not found" });

  page.links.push(req.body);
  await page.save();

  res.json(page);
}

// GET PUBLIC PAGE
async function handleGetPublicPage(req, res) {
  const { pageId } = req.params;

  const page = await Page.findById(pageId);
  if (!page) return res.status(404).json({ error: "Page not found" });

  res.json(page);
}

module.exports = {
  handleCreatePage,
  handleAddLink,
  handleGetPublicPage,
};
