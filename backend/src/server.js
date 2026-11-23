
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const assessmentRoutes = require("./assessment");
const recommendationRoutes = require("./recommendations");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Competency Diagnostic API is running!"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
