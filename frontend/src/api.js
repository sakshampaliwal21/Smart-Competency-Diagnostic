const API_URL = "http://10.7.9.52:5001";

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not fetch profile");
  return data;
};

export const getQuestions = async (token) => {
  const response = await fetch(`${API_URL}/api/assessment/questions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load questions");
  return data;
};

export const submitAssessment = async (token, answers) => {
  const response = await fetch(`${API_URL}/api/assessment/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answers })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Assessment submission failed");
  return data;
};

export const getJobs = async (token) => {
  const response = await fetch(`${API_URL}/api/recommendations/jobs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load jobs");
  return data;
};

export const getCourses = async (token) => {
  const response = await fetch(`${API_URL}/api/recommendations/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load courses");
  return data;
};

export const getJobRecommendations = async (token) => {
  const response = await fetch(`${API_URL}/api/recommendations/jobs`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load job recommendations");
  return data;
};

export const getCourseRecommendations = async (token) => {
  const response = await fetch(`${API_URL}/api/recommendations/courses`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not load course recommendations");
  return data;
};

export const getCompetencyReport = async (token) => {
  const response = await fetch(`${API_URL}/api/assessment/report`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load competency report");
  }

  return data;
};
