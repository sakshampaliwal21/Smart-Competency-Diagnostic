
const prisma = require("./db");

const questions = [
  {
    category: "JavaScript",
    question: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "function", "class"],
    correctAnswer: 1
  },
  {
    category: "JavaScript",
    question: "Which method converts JSON text into a JavaScript object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"],
    correctAnswer: 1
  },
  {
    category: "Programming",
    question: "What is the time complexity of binary search?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    correctAnswer: 2
  },
  {
    category: "Programming",
    question: "Which data structure follows FIFO?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctAnswer: 1
  },
  {
    category: "Database",
    question: "Which SQL command retrieves records?",
    options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
    correctAnswer: 2
  },
  {
    category: "Database",
    question: "What does a primary key identify?",
    options: [
      "A database",
      "A table",
      "A unique row",
      "A column type"
    ],
    correctAnswer: 2
  },
  {
    category: "Computer Science",
    question: "Which protocol is commonly used for secure web communication?",
    options: ["HTTP", "FTP", "HTTPS", "SMTP"],
    correctAnswer: 2
  },
  {
    category: "Computer Science",
    question: "Which of these is an operating system?",
    options: ["Python", "Linux", "HTML", "MySQL"],
    correctAnswer: 1
  }
];

async function seedQuestions() {
  try {
    const count = await prisma.question.count();

    if (count === 0) {
      await prisma.question.createMany({
        data: questions
      });

      console.log("Assessment questions added successfully!");
    } else {
      console.log("Questions already exist. Skipping seed.");
    }
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedQuestions();
