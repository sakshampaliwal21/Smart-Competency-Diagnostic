
const express = require("express");
const prisma = require("./db");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();

// GET PROFILE
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile"
    });
  }
});

// CREATE OR UPDATE PROFILE
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { education, skills } = req.body;

    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        message: "Skills must be an array"
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      update: {
        education,
        skills
      },
      create: {
        userId: req.userId,
        education: education || null,
        skills: skills || []
      }
    });

    res.json({
      message: "Profile saved successfully",
      profile
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Failed to save profile"
    });
  }
});

module.exports = router;
