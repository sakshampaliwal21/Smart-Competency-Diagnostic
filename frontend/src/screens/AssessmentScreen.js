import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getQuestions, submitAssessment } from "../api";

export default function AssessmentScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const data = await getQuestions(token);
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers(previous => ({
      ...previous,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      Alert.alert("Incomplete Assessment", "Please answer every question.");
      return;
    }

    try {
      setSubmitting(true);

      const token = await AsyncStorage.getItem("token");

      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId: Number(questionId),
          selectedOption
        })
      );

      const data = await submitAssessment(token, formattedAnswers);
      setResult(data);
    } catch (error) {
      Alert.alert("Submission Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading questions...</Text>
      </View>
    );
  }

  if (result) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Assessment Completed!</Text>

        <Text style={styles.score}>
          {result.totalScore ?? result.assessment?.totalScore ?? "Submitted"}
          {typeof (result.totalScore ?? result.assessment?.totalScore) === "number"
            ? "%"
            : ""}
        </Text>

        <Text style={styles.subtitle}>Your competency results</Text>

        {result.competencyLevel && (
          <Text style={styles.resultText}>
            Competency Level: {result.competencyLevel}
          </Text>
        )}

        {result.categoryScores &&
          Object.entries(result.categoryScores).map(([category, score]) => (
            <Text key={category} style={styles.resultText}>
              {category}: {typeof score === "object" ? score.score : score}%
            </Text>
          ))}

        {result.skillGaps && (
          <View style={styles.card}>
            <Text style={styles.heading}>Skills to Improve</Text>
            <Text style={styles.resultText}>
              {Array.isArray(result.skillGaps)
                ? result.skillGaps.join(", ") || "No major skill gaps"
                : JSON.stringify(result.skillGaps)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Dashboard")}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Competency Assessment</Text>
      <Text style={styles.subtitle}>
        Answer all questions to evaluate your skills.
      </Text>

      <Text style={styles.progress}>
        Answered: {Object.keys(answers).length} / {questions.length}
      </Text>

      {questions.map((question, index) => (
        <View key={question.id} style={styles.card}>
          <Text style={styles.category}>{question.category}</Text>

          <Text style={styles.question}>
            {index + 1}. {question.question}
          </Text>

          {question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === optionIndex;

            return (
              <TouchableOpacity
                key={optionIndex}
                style={[
                  styles.option,
                  selected && styles.selectedOption
                ]}
                onPress={() => selectAnswer(question.id, optionIndex)}
              >
                <Text style={[
                  styles.optionText,
                  selected && styles.selectedText
                ]}>
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {questions.length === 0 && (
        <Text style={styles.resultText}>No questions are available.</Text>
      )}

      <TouchableOpacity
        style={[styles.button, (submitting || questions.length === 0) && styles.disabled]}
        onPress={handleSubmit}
        disabled={submitting || questions.length === 0}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Submit Assessment</Text>
        )}
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
    color: "#64748B",
    textAlign: "center",
    marginVertical: 12
  },
  progress: {
    color: "#2563EB",
    fontWeight: "bold",
    marginBottom: 15
  },
  card: {
    backgroundColor: "white",
    padding: 17,
    borderRadius: 12,
    marginBottom: 18
  },
  category: {
    color: "#2563EB",
    fontWeight: "bold",
    marginBottom: 10
  },
  question: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 15
  },
  option: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    padding: 13,
    marginBottom: 9
  },
  selectedOption: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB"
  },
  optionText: {
    color: "#334155"
  },
  selectedText: {
    color: "#1D4ED8",
    fontWeight: "bold"
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20
  },
  disabled: {
    opacity: 0.5
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  },
  score: {
    fontSize: 42,
    color: "#2563EB",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 25
  },
  resultText: {
    color: "#334155",
    fontSize: 16,
    marginVertical: 8
  },
  heading: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#172554",
    marginBottom: 10
  }
});
