
const express = require("express");
const prisma = require("./db");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();

// GET ALL QUESTIONS
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        category: true,
        question: true,
        options: true
      }
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch questions"
    });
  }
});

// SUBMIT ASSESSMENT AND CALCULATE SCORES
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Answers are required"
      });
    }

    const questionIds = answers.map(answer => answer.questionId);

    if (
      questionIds.some(id => !Number.isInteger(id)) ||
      new Set(questionIds).size !== questionIds.length ||
      answers.some(answer => !Number.isInteger(answer.selectedOption))
    ) {
      return res.status(400).json({
        message: "Invalid or duplicate answers"
      });
    }

    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds }
      }
    });

    if (questions.length !== answers.length) {
      return res.status(400).json({
        message: "Invalid question IDs"
      });
    }

    const questionMap = new Map(
      questions.map(question => [question.id, question])
    );

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      if (
        answer.selectedOption < 0 ||
        answer.selectedOption >= question.options.length
      ) {
        return res.status(400).json({
          message: "Invalid selected option"
        });
      }
    }

    // Calculate correct answers
    let correctCount = 0;

    const categoryScores = {};

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);

      const isCorrect =
        question.correctAnswer === answer.selectedOption;

      if (isCorrect) {
        correctCount++;
      }

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = {
          totalQuestions: 0,
          correctAnswers: 0
        };
      }

      categoryScores[question.category].totalQuestions++;

      if (isCorrect) {
        categoryScores[question.category].correctAnswers++;
      }
    }

    // Calculate overall percentage
    const totalQuestions = answers.length;
    const incorrectCount = totalQuestions - correctCount;

    const totalScore = Number(
      ((correctCount / totalQuestions) * 100).toFixed(2)
    );

    // Calculate category-wise percentages
    const categoryResults = {};

    for (const category in categoryScores) {
      const data = categoryScores[category];

      const score = Number(
        ((data.correctAnswers / data.totalQuestions) * 100).toFixed(2)
      );

      categoryResults[category] = {
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score
      };
    }

    // Determine competency level
    let competencyLevel;

    if (totalScore < 40) {
      competencyLevel = "Beginner";
    } else if (totalScore < 75) {
      competencyLevel = "Intermediate";
    } else {
      competencyLevel = "Advanced";
    }

    // Identify skill gaps
    const skillGaps = Object.keys(categoryResults).filter(
      category => categoryResults[category].score < 60
    );

    // Save assessment and answers
    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId,
        totalScore,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            selectedOption: answer.selectedOption,
            isCorrect:
              questionMap.get(answer.questionId).correctAnswer ===
              answer.selectedOption
          }))
        }
      }
    });

    res.status(201).json({
      message: "Assessment submitted successfully",
      assessmentId: assessment.id,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      overallScore: totalScore,
      competencyLevel,
      categoryScores: categoryResults,
      skillGaps
    });

  } catch (error) {
    console.error("Assessment error:", error);

    res.status(500).json({
      message: "Assessment submission failed"
    });
  }
});


// GET LATEST CANDIDATE COMPETENCY REPORT
router.get("/report", authMiddleware, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                education: true,
                skills: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              select: {
                category: true,
                question: true
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({
        message: "No assessment found. Please complete an assessment first."
      });
    }

    const categoryData = {};

    for (const answer of assessment.answers) {
      const category = answer.question.category;

      if (!categoryData[category]) {
        categoryData[category] = {
          totalQuestions: 0,
          correctAnswers: 0
        };
      }

      categoryData[category].totalQuestions++;

      if (answer.isCorrect) {
        categoryData[category].correctAnswers++;
      }
    }

    const categoryScores = {};

    for (const category in categoryData) {
      const data = categoryData[category];

      categoryScores[category] = {
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score: Number(
          ((data.correctAnswers / data.totalQuestions) * 100).toFixed(2)
        )
      };
    }

    const skillGaps = Object.keys(categoryScores).filter(
      category => categoryScores[category].score < 60
    );

    let competencyLevel;

    if (assessment.totalScore < 40) {
      competencyLevel = "Beginner";
    } else if (assessment.totalScore < 75) {
      competencyLevel = "Intermediate";
    } else {
      competencyLevel = "Advanced";
    }

    res.json({
      candidate: {
        name: assessment.user.name,
        email: assessment.user.email,
        education: assessment.user.profile?.education || "Not added",
        skills: assessment.user.profile?.skills || []
      },
      assessment: {
        id: assessment.id,
        date: assessment.createdAt,
        totalQuestions: assessment.answers.length,
        correctAnswers: assessment.answers.filter(a => a.isCorrect).length,
        overallScore: assessment.totalScore,
        competencyLevel
      },
      categoryScores,
      skillGaps
    });

  } catch (error) {
    console.error("Report error:", error);

    res.status(500).json({
      message: "Failed to generate competency report"
    });
  }
});

module.exports = router;
