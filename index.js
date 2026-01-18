require("dotenv").config(); 
const express = require('express');
const cors=require("cors");
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectToMongoDB } = require("./connect");
const { checkForAuthentication } = require('./middlewares/auth');
const URL = require("./models/url");
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');
const pageRoute = require("./routes/page");

const app = express();
const PORT = 8002;
app.use(
  cors({
      origin: process.env.VITE_FRONTEND_URL, // frontend (Vite)
    credentials: true,
  })
)
// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

// View Engingine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Database 
connectToMongoDB('mongodb://127.0.0.1:27017/short-url')
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

//  API Routes 
app.use("/page", pageRoute);
app.use("/url", urlRoute);
app.use("/user", userRoute);


//Redirect Route (IMPORTANT POSITION) 
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

  res.redirect(entry.redirectURL);
});


app.use("/", staticRoute);


app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
