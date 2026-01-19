// const express = require("express");
// const router = express.Router();
// const Page = require("../models/page");

// const {
//   handleCreatePage,
//   handleAddLink,
//   handleGetPublicPage
// } = require("../controllers/page");

// // TEMP: no auth while testing backend
// router.post("/create", handleCreatePage);

// router.post("/:username/link", handleAddLink);
// router.get("/:username", handleGetPublicPage);
// router.get("/:username/:linkId", async (req, res) => {
//   const { username, linkId } = req.params;

//   const page = await Page.findOne({ username });
//   if (!page) return res.status(404).send("Page not found");

//   const link = page.links.id(linkId);
//   if (!link) return res.status(404).send("Link not found");

//   link.clicks += 1;
//   await page.save();

//   return res.redirect(link.url);
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Page = require("../models/page");
// const {
//   handleCreatePage,
//   handleAddLink,
//   handleGetPublicPage,
// } = require("../controllers/page");
// const { checkForAuthentication } = require("../middlewares/auth");

// // 🔐 Protected routes
// router.post("/create", checkForAuthentication, handleCreatePage);
// router.post("/link", checkForAuthentication, handleAddLink);

// // 🌍 Public page
// router.get("/:pageId", handleGetPublicPage);

// // 🌍 Public redirect
// router.get("/:pageId/:linkId", async (req, res) => {
//   const { pageId, linkId } = req.params;

//   const page = await Page.findById(pageId);
//   if (!page) return res.status(404).send("Page not found");

//   const link = page.links.id(linkId);
//   if (!link) return res.status(404).send("Link not found");

//   return res.redirect(link.url);
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const Page = require("../models/page");
// const {
//   handleCreatePage,
//   handleAddLink,
//   handleGetMyPage,
//   handleGetPublicPage,
// } = require("../controllers/page");
// const { checkForAuthentication } = require("../middlewares/auth");

// /* 🔐 PRIVATE */
// router.get("/me", checkForAuthentication, handleGetMyPage);
// router.post("/create", checkForAuthentication, handleCreatePage);
// router.post("/link", checkForAuthentication, handleAddLink);

// /* 🌍 PUBLIC */
// router.get("/:pageId", handleGetPublicPage);

// router.get("/:pageId/:linkId", async (req, res) => {
//   const { pageId, linkId } = req.params;

//   const page = await Page.findById(pageId);
//   if (!page) return res.status(404).send("Page not found");

//   const link = page.links.id(linkId);
//   if (!link) return res.status(404).send("Link not found");

//   return res.redirect(link.url);
// });

// module.exports = router;




// const express = require("express");
// const router = express.Router();
// const Page = require("../models/page");
// const {
//   handleCreatePage,
//   handleAddLink,
//   handleGetPublicPage,
// } = require("../controllers/page");
// const { checkForAuthentication } = require("../middlewares/auth");

// // 🔐 Auth routes
// router.post("/create", checkForAuthentication, handleCreatePage);
// router.post("/link", checkForAuthentication, handleAddLink);

// // 🌍 Public page (BY PAGE ID)
// // router.get("/:pageId", handleGetPublicPage);

// router.get("/me", checkForAuthentication, async (req, res) => {
//   const page = await Page.findOne({ createdBy: req.user._id });
//   if (!page) return res.status(404).json({ error: "No page" });
//   res.json(page);
// });

// router.get("/public/:pageId", handleGetPublicPage);




// // 🌍 Redirect
// router.get("/:pageId/:linkId", async (req, res) => {
//   const { pageId, linkId } = req.params;

//   if (!pageId.match(/^[0-9a-fA-F]{24}$/)) {
//     return res.status(400).send("Invalid page id");
//   }

//   const page = await Page.findById(pageId);
//   if (!page) return res.status(404).send("Page not found");

//   const link = page.links.id(linkId);
//   if (!link) return res.status(404).send("Link not found");

//   return res.redirect(link.url);
// });

// module.exports = router;




// const express = require("express");
// const router = express.Router();
// const Page = require("../models/page");
// const {
//   handleCreatePage,
//   handleAddLink,
//   handleGetPublicPage,
// } = require("../controllers/page");
// const { checkForAuthentication } = require("../middlewares/auth");

// // 🔐 protected
// router.post("/create", checkForAuthentication, handleCreatePage);
// router.post("/link", checkForAuthentication, handleAddLink);

// // 🌍 PUBLIC PAGE (THIS IS REQUIRED)
// router.get("/:pageId", handleGetPublicPage);

// // 🌍 REDIRECT LINK
// router.get("/:pageId/:linkId", async (req, res) => {
//   const { pageId, linkId } = req.params;

//   const page = await Page.findById(pageId);
//   if (!page) return res.status(404).send("Page not found");

//   const link = page.links.id(linkId);
//   if (!link) return res.status(404).send("Link not found");

//   return res.redirect(link.url);
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Page = require("../models/page");
const {
  handleCreatePage,
  handleAddLink,
  handleGetPublicPage,
} = require("../controllers/page");
const { checkForAuthentication } = require("../middlewares/auth");

// AUTH
router.get("/me", checkForAuthentication, async (req, res) => {
  const page = await Page.findOne({ createdBy: req.user._id });
  if (!page) return res.status(404).json({ error: "No page" });
  res.json(page);
});

router.post("/create", checkForAuthentication, handleCreatePage);
router.post("/link", checkForAuthentication, handleAddLink);

// PUBLIC
router.get("/public/:pageId", handleGetPublicPage);

// REDIRECT
router.get("/:pageId/:linkId", async (req, res) => {
  const page = await Page.findById(req.params.pageId);
  if (!page) return res.status(404).send("Page not found");

  const link = page.links.id(req.params.linkId);
  if (!link) return res.status(404).send("Link not found");

  res.redirect(link.url);
});
// ❌ DELETE LINK (OWNER ONLY)
router.delete("/link/:linkId", checkForAuthentication, async (req, res) => {
  try {
    const { linkId } = req.params;

    const page = await Page.findOne({
      createdBy: req.user._id,
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    page.links = page.links.filter(
      (l) => l._id.toString() !== linkId
    );

    await page.save();

    return res.json(page);
  } catch (err) {
    console.error("Delete link error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ❌ DELETE PAGE (OWNER ONLY)
router.delete("/delete", checkForAuthentication, async (req, res) => {
  try {
    const page = await Page.findOneAndDelete({
      createdBy: req.user._id,
    });

    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    return res.json({ message: "Page deleted successfully" });
  } catch (err) {
    console.error("Delete page error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
