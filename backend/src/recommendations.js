
const express = require("express");
const prisma = require("./db");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();

// Predefined job data
const jobs = [
  {
    title: "Frontend Developer",
    requiredSkills: ["JavaScript", "React", "HTML", "CSS"]
  },
  {
    title: "Backend Developer",
    requiredSkills: ["Node.js", "JavaScript", "SQL", "Express"]
  },
  {
    title: "Python Developer",
    requiredSkills: ["Python", "SQL", "Programming"]
  },
  {
    title: "Full Stack Developer",
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL"]
  }
];

// Predefined course data
const courses = [
  {
    title: "JavaScript Fundamentals",
    category: "JavaScript",
    platform: "Coursera"
  },
  {
    title: "Database Management",
    category: "Database",
    platform: "Udemy"
  },
  {
    title: "Programming Fundamentals",
    category: "Programming",
    platform: "freeCodeCamp"
  },
  {
    title: "Computer Science Basics",
    category: "Computer Science",
    platform: "Coursera"
  }
];

// GET JOB RECOMMENDATIONS
router.get("/jobs", authMiddleware, async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Please create your profile first"
      });
    }

    const candidateSkills = profile.skills.map(skill =>
      skill.toLowerCase()
    );

    const recommendations = jobs.map(job => {
      const matchedSkills = job.requiredSkills.filter(skill =>
        candidateSkills.includes(skill.toLowerCase())
      );

      const matchPercentage = Math.round(
        (matchedSkills.length / job.requiredSkills.length) * 100
      );

      return {
        title: job.title,
        requiredSkills: job.requiredSkills,
        matchedSkills,
        matchPercentage
      };
    });

    recommendations.sort(
      (a, b) => b.matchPercentage - a.matchPercentage
    );

    res.json(recommendations);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch job recommendations"
    });
  }
});

// GET COURSE RECOMMENDATIONS
router.get("/courses", authMiddleware, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        message: "Complete an assessment first"
      });
    }

    const categoryScores = {};

    assessment.answers.forEach(answer => {
      const category = answer.question.category;

      if (!categoryScores[category]) {
        categoryScores[category] = {
          total: 0,
          correct: 0
        };
      }

      categoryScores[category].total++;

      if (answer.isCorrect) {
        categoryScores[category].correct++;
      }
    });

    const skillGaps = Object.keys(categoryScores).filter(category => {
      const score =
        (categoryScores[category].correct /
          categoryScores[category].total) * 100;

      return score < 60;
    });

    const recommendations = courses.filter(course =>
      skillGaps.includes(course.category)
    );

    res.json({
      skillGaps,
      recommendedCourses: recommendations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch course recommendations"
    });
  }
});

module.exports = router;
