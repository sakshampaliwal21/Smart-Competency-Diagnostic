# Smart Competency Diagnostic and Candidate Profile Score Calculator

A simple application that helps candidates understand their skills, test their technical knowledge, identify weak areas, and explore suitable job and course recommendations.

## Features

- User registration and login
- Candidate profile management
- Technical competency assessment
- Overall and category-wise scores
- Skill gap identification
- Job recommendations with match percentages
- Course recommendations
- Candidate performance report

## Tech Stack

- **Frontend:** React Native, Expo, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** JWT, bcrypt
- **Tools:** Docker, Postman

## Project Structure

```text
Smart-Competency-Diagnostic/
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
│   └── src/
│       └── screens/
├── docker-compose.yml
└── README.md
```

## Getting Started

**1. Start the database**

```bash
docker compose up -d
```

**2. Set up the backend**

Create a `backend/.env` file with your database URL, port and JWT secret.

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

**3. Start the frontend**

In another terminal:

```bash
cd frontend
npm install
npx expo start
```

Update the API URL in `frontend/src/api.js` with your computer's local IP address.

## What It Does

Candidates can take an assessment, view their scores, understand their skill gaps, and get job and course suggestions based on their performance and profile.