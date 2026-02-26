const express = require("express");
const { handleUserSignup, handleUserLogin } = require("../controllers/user");
const User = require("../models/user");
const { setUser } = require("../service/auth");
const { checkForAuthentication } = require("../middlewares/auth");

const router = express.Router();

// ✅ AUTH CHECK
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  // Fetch full user to include plan
  User.findById(req.user._id)
    .select("-password")
    .then((u) => {
      if (!u) return res.status(401).json({ user: null });
      res.json({
        user: {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          plan: u.plan,
          googleId: u.googleId,
          createdAt: u.createdAt,
        },
      });
    })
    .catch(() => res.status(500).json({ user: null }));
});

// ✅ SIGNUP
router.post("/", handleUserSignup);

// ✅ LOGIN
router.post("/login", handleUserLogin);

// ✅ GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  try {
    const { credential, googleUser } = req.body;

    let email, name, googleId;

    if (credential) {
      // ID token flow
      const { OAuth2Client } = require("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
    } else if (googleUser) {
      // Implicit flow — user info already fetched on frontend
      googleId = googleUser.sub;
      email = googleUser.email;
      name = googleUser.name;
    } else {
      return res.status(400).json({ error: "Missing credential" });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        password: null,
        role: "NORMAL",
        plan: "FREE",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = setUser(user);
    const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === "development" || (req.hostname === "localhost");
    res.cookie("token", token, {
      httpOnly: true,
      secure: !isLocal,
      sameSite: isLocal ? "lax" : "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Google login successful",
      user: { _id: user._id, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(401).json({ error: "Google authentication failed" });
  }
});

// ✅ CHANGE PASSWORD (non-Google users)
router.post("/change-password", checkForAuthentication, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.googleId && !user.password) {
      return res.status(400).json({ error: "Google users cannot change password" });
    }

    if (user.password !== oldPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ✅ LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
});

module.exports = router;
