const {v4: uuidv4}=require('uuid')
const User = require('../models/user');
const {setUser}=require('../service/auth');

// async function handleUserSignup(req,res) {
//     const {name, email ,password } = req.body;
//     await User.create({
//         name,
//         email,
//         password,
//     });
//     return res.redirect("/");
// }

async function handleUserSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User created successfully",
    });

  } catch (err) {
    // 🔥 duplicate email
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    console.error("Signup error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = setUser(user);
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.json({
    message: "Login successful",
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
  });
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
}