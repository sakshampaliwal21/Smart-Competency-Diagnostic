import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getJobs, getCourses } from "../api";

export default function RecommendationScreen({ navigation }) {
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
        getJobs(token),
        getCourses(token)
      ]);

      setJobs(Array.isArray(jobData) ? jobData : jobData.jobs || []);
      setCourses(courseData.recommendedCourses || []);
      setSkillGaps(courseData.skillGaps || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Finding recommendations...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Recommendations</Text>
      <Text style={styles.subtitle}>
        Opportunities based on your skills and assessment.
      </Text>

      <Text style={styles.sectionTitle}>Recommended Jobs</Text>

      {jobs.length > 0 ? jobs.map((job, index) => (
        <View style={styles.card} key={job.title || index}>
          <Text style={styles.cardTitle}>{job.title}</Text>

          <Text style={styles.match}>
            {job.matchPercentage}% Match
          </Text>

          <Text style={styles.label}>Required Skills</Text>
          <Text style={styles.detail}>
            {job.requiredSkills?.join(", ") || "Not available"}
          </Text>

          <Text style={styles.label}>Your Matching Skills</Text>
          <Text style={styles.detail}>
            {job.matchedSkills?.join(", ") || "No matching skills yet"}
          </Text>
        </View>
      )) : (
        <Text style={styles.detail}>No job recommendations available.</Text>
      )}

      <Text style={styles.sectionTitle}>Your Skill Gaps</Text>

      <View style={styles.card}>
        <Text style={styles.detail}>
          {skillGaps.length > 0
            ? skillGaps.join(", ")
            : "No skill gaps identified."}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Recommended Courses</Text>

      {courses.length > 0 ? courses.map((course, index) => (
        <View style={styles.card} key={course.title || index}>
          <Text style={styles.cardTitle}>{course.title}</Text>
          <Text style={styles.detail}>Category: {course.category}</Text>
          <Text style={styles.detail}>Platform: {course.platform}</Text>
        </View>
      )) : (
        <Text style={styles.detail}>
          No courses available. Complete an assessment first.
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>Back to Dashboard</Text>
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
    marginBottom: 13
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#172554"
  },
  match: {
    color: "#2563EB",
    fontSize: 19,
    fontWeight: "bold",
    marginVertical: 10
  },
  label: {
    color: "#475569",
    fontWeight: "bold",
    marginTop: 8
  },
  detail: {
    color: "#475569",
    fontSize: 15,
    marginTop: 6
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
});
