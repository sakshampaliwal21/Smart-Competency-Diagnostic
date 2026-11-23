import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AssessmentScreen from "./src/screens/AssessmentScreen";
import RecommendationsScreen from "./src/screens/RecommendationsScreen";
import ReportScreen from "./src/screens/ReportScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        <Stack.Screen
          name="Report"
          component={ReportScreen}
          options={{ title: "Candidate Report" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
