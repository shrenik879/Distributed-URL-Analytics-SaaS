require("dotenv").config();
const express = require('express');
const cors = require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectToMongoDB } = require("./connect");
const { checkForAuthentication } = require('./middlewares/auth');
const URL = require("./models/url");
const User = require("./models/user");
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');
const pageRoute = require("./routes/page");
const statsRoute = require("./routes/stats");
const paymentRoute = require("./routes/payment");
const domainRoute = require("./routes/domain");
const adminRoute = require("./routes/admin");

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8002;

// CORS — allow both user frontend (5173) and admin panel (5174)
// CORS — allow both user frontend (5173) and admin panel (5174)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL || "http://localhost:5174",
  "https://url-shortener-git-main-shrenik-kondekars-projects.vercel.app",
  "https://url-shortener-theta-self.vercel.app"
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow precise matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview branch deployment
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// app.options("*", cors());

// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

// View Engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Database 
connectToMongoDB(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Seed admin user
    try {
      const adminEmail = "shrenikkondekar@gmail.com";
      const existing = await User.findOne({ email: adminEmail });
      if (existing) {
        if (existing.role !== "ADMIN") {
          existing.role = "ADMIN";
          await existing.save();
          console.log(`✅ ${adminEmail} promoted to ADMIN`);
        }
      } else {
        await User.create({
          name: "Shrenik",
          email: adminEmail,
          password: "shrenik5213",
          role: "ADMIN",
        });
        console.log(`✅ Admin user created: ${adminEmail}`);
      }
    } catch (seedErr) {
      console.error("Admin seed error:", seedErr);
    }
  })
  .catch((err) => console.error("MongoDB connection failed:", err));

//  API Routes 
app.use("/page", pageRoute);
app.use("/url", urlRoute);
app.use("/user", userRoute);
app.use("/stats", statsRoute);
app.use("/payment", paymentRoute);
app.use("/domain", domainRoute);
app.use("/admin", adminRoute);


// Redirect Route (checks isActive)
app.get('/url/:shortId', async (req, res) => {
  const { shortId } = req.params;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    { $push: { visitHistory: { timestamp: Date.now() } } },
    { new: true }
  );

  if (!entry) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  if (entry.isActive === false) {
    return res.status(410).json({ error: "This URL has been disabled" });
  }

  res.redirect(entry.redirectURL);
});


app.use("/", staticRoute);


app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));

