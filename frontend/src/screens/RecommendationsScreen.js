import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getJobRecommendations,
  getCourseRecommendations
} from "../api";

export default function RecommendationsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const [jobData, courseData] = await Promise.all([
        getJobRecommendations(token),
        getCourseRecommendations(token)
      ]);

      setJobs(Array.isArray(jobData) ? jobData : jobData.jobs || []);
      setCourses(
        Array.isArray(courseData.recommendedCourses)
          ? courseData.recommendedCourses
          : []
      );
      setSkillGaps(
        Array.isArray(courseData.skillGaps)
          ? courseData.skillGaps
          : []
      );
    } catch (error) {
      Alert.alert("Recommendations", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.text}>Finding your recommendations...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Recommendations</Text>
      <Text style={styles.subtitle}>
        Explore career opportunities and learning paths based on your skills.
      </Text>

      <Text style={styles.sectionTitle}>Recommended Jobs</Text>

      {jobs.length > 0 ? jobs.map((job, index) => (
        <View style={styles.card} key={job.title || index}>
          <Text style={styles.jobTitle}>{job.title}</Text>

          <Text style={styles.match}>
            {job.matchPercentage ?? 0}% Match
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(100, Number(job.matchPercentage) || 0))}%` }
              ]}
            />
          </View>

          <Text style={styles.label}>Matched Skills</Text>
          <Text style={styles.text}>
            {job.matchedSkills?.join(", ") || "No matching skills yet"}
          </Text>

          <Text style={styles.label}>Required Skills</Text>
          <Text style={styles.text}>
            {job.requiredSkills?.join(", ") || "Not available"}
          </Text>
        </View>
      )) : (
        <Text style={styles.text}>
          No job recommendations available. Add skills to your profile.
        </Text>
      )}

      <Text style={styles.sectionTitle}>Your Skill Gaps</Text>

      <View style={styles.card}>
        {skillGaps.length > 0 ? (
          skillGaps.map((skill, index) => (
            <Text key={index} style={styles.gapText}>
              • {skill}
            </Text>
          ))
        ) : (
          <Text style={styles.text}>No skill gaps identified.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Recommended Courses</Text>

      {courses.length > 0 ? courses.map((course, index) => (
        <View style={styles.card} key={course.title || index}>
          <Text style={styles.jobTitle}>{course.title}</Text>
          <Text style={styles.text}>Category: {course.category}</Text>
          <Text style={styles.text}>Platform: {course.platform}</Text>
        </View>
      )) : (
        <View style={styles.card}>
          <Text style={styles.text}>
            No courses recommended yet. Complete an assessment to identify your learning needs.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Assessment")}
      >
        <Text style={styles.buttonText}>Retake Assessment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F5F7FB",
    flexGrow: 1
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#172554",
    textAlign: "center",
    marginTop: 15
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginVertical: 15
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#172554",
    marginTop: 22,
    marginBottom: 12
  },
  card: {
    backgroundColor: "white",
    padding: 17,
    borderRadius: 12,
    marginBottom: 14
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#172554"
  },
  match: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 10
  },
  progressBackground: {
    height: 9,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    marginVertical: 12,
    overflow: "hidden"
  },
  progressFill: {
    height: 9,
    backgroundColor: "#2563EB",
    borderRadius: 10
  },
  label: {
    color: "#475569",
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4
  },
  text: {
    color: "#475569",
    fontSize: 14,
    marginTop: 5
  },
  gapText: {
    color: "#DC2626",
    fontSize: 15,
    marginVertical: 5
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  },
  secondaryButton: {
    padding: 15,
    alignItems: "center",
    marginBottom: 15
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontWeight: "bold"
  }
});
