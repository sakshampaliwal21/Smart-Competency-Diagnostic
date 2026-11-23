import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../api";

export default function DashboardScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const data = await getProfile(token);
      setProfile(data);
    } catch (error) {
      Alert.alert("Profile", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Smart Competency Diagnostic</Text>

      <View style={styles.profileCard}>
        <Text style={styles.heading}>Your Profile</Text>
        <Text style={styles.text}>
          Education: {profile?.education || "Not added"}
        </Text>
        <Text style={styles.text}>
          Skills: {profile?.skills?.join(", ") || "Not added"}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { marginBottom: 15 }]}
        onPress={() => navigation.navigate("Assessment")}
      >
        <Text style={styles.buttonText}>Start Competency Assessment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Recommendations")}
      >
        <Text style={styles.buttonText}>View Job & Course Recommendations</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={() => navigation.navigate("Report")}
      >
        <Text style={styles.buttonText}>View Competency Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#F5F7FB"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#172554",
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 8,
    marginBottom: 30
  },
  profileCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#172554"
  },
  text: {
    fontSize: 15,
    color: "#334155",
    marginTop: 8
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },
  logoutButton: {
    backgroundColor: "#DC2626",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15
  }
});
