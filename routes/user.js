// const express = require("express");
// const { handleUserSignup, handleUserLogin} = require("../controllers/user");

// const router = express.Router();

// router.get("/me", (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ user: null });
//   }
//   res.json({ user: req.user });
// });
// router.post("/",handleUserSignup);
// router.post("/login",handleUserLogin);

// module.exports = router;
const express = require("express");
const { handleUserSignup, handleUserLogin } = require("../controllers/user");

const router = express.Router();

// ✅ AUTH CHECK (USED BY REACT)
// router.get("/me", (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ user: null });
//   }
//   return res.json({ user: req.user });
// });
router.get("/me", (req, res) => {
  console.log("COOKIE:", req.cookies);
  console.log("USER:", req.user);

  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  res.json({ user: req.user });
});

// ✅ SIGNUP
router.post("/", handleUserSignup);

// ✅ LOGIN
router.post("/login", handleUserLogin);

// ✅ LOGOUT (🔥 THIS WAS MISSING)
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
