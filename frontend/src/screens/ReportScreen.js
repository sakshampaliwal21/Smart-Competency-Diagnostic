import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCompetencyReport } from "../api";

export default function ReportScreen({ navigation }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const data = await getCompetencyReport(token);
      setReport(data);
    } catch (error) {
      Alert.alert("Report Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.text}>Generating your report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.center}>
        <Text style={styles.heading}>No report available</Text>
        <Text style={styles.text}>Complete an assessment first.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Assessment")}
        >
          <Text style={styles.buttonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { candidate, assessment, categoryScores, skillGaps } = report;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Competency Report</Text>
      <Text style={styles.subtitle}>
        Your candidate performance overview
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Candidate Information</Text>
        <Text style={styles.info}>Name: {candidate.name}</Text>
        <Text style={styles.info}>Email: {candidate.email}</Text>
        <Text style={styles.info}>Education: {candidate.education}</Text>
        <Text style={styles.info}>
          Skills: {candidate.skills.join(", ") || "Not added"}
        </Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.score}>{assessment.overallScore}%</Text>
        <Text style={styles.level}>{assessment.competencyLevel}</Text>
        <Text style={styles.scoreInfo}>
          {assessment.correctAnswers} correct out of {assessment.totalQuestions}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Category-wise Performance</Text>

        {Object.entries(categoryScores).map(([category, data]) => (
          <View key={category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.percentage}>{data.score}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(0, Math.min(100, data.score))}%`
                  }
                ]}
              />
            </View>

            <Text style={styles.smallText}>
              {data.correctAnswers} / {data.totalQuestions} correct answers
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Identified Skill Gaps</Text>

        {skillGaps.length > 0 ? (
          skillGaps.map((skill, index) => (
            <Text key={index} style={styles.gap}>
              • {skill}
            </Text>
          ))
        ) : (
          <Text style={styles.info}>No major skill gaps identified.</Text>
        )}
      </View>

      <Text style={styles.date}>
        Assessment Date: {new Date(assessment.date).toLocaleDateString()}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Recommendations")}
      >
        <Text style={styles.buttonText}>View Job & Course Recommendations</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.secondaryText}>Back to Dashboard</Text>
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
    padding: 25
  },
  title: {
    fontSize: 27,
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
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 15
  },
  info: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 9
  },
  scoreCard: {
    backgroundColor: "#DBEAFE",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18
  },
  scoreLabel: {
    color: "#1E40AF",
    fontSize: 16,
    fontWeight: "bold"
  },
  score: {
    color: "#1D4ED8",
    fontSize: 48,
    fontWeight: "bold",
    marginVertical: 8
  },
  level: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#172554"
  },
  scoreInfo: {
    color: "#475569",
    marginTop: 8
  },
  categoryItem: {
    marginBottom: 18
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  categoryName: {
    color: "#334155",
    fontWeight: "bold"
  },
  percentage: {
    color: "#2563EB",
    fontWeight: "bold"
  },
  progressBackground: {
    height: 9,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden"
  },
  progressFill: {
    height: 9,
    backgroundColor: "#2563EB",
    borderRadius: 10
  },
  smallText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6
  },
  gap: {
    color: "#DC2626",
    fontSize: 15,
    marginBottom: 8
  },
  date: {
    textAlign: "center",
    color: "#64748B",
    marginVertical: 10
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  secondaryButton: {
    padding: 15,
    alignItems: "center",
    marginBottom: 20
  },
  secondaryText: {
    color: "#2563EB",
    fontWeight: "bold"
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#172554"
  },
  text: {
    color: "#475569",
    marginTop: 10
  }
});
