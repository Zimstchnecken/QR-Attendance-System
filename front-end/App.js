import { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import {
  AdminLoginScreen,
  StudentLoginScreen,
  StudentScreen,
  AdminScreen,
} from "./app/index";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("adminLogin");

  const handleAdminLogin = () => setCurrentScreen("admin");
  const handleStudentLogin = () => setCurrentScreen("student");

  const handleLogout = () => {
    setCurrentScreen("adminLogin");
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      {currentScreen === "adminLogin" && (
        <AdminLoginScreen
          onLogin={handleAdminLogin}
          onSwitchToStudent={() => setCurrentScreen("studentLogin")}
        />
      )}
      {currentScreen === "studentLogin" && (
        <StudentLoginScreen
          onLogin={handleStudentLogin}
          onSwitchToAdmin={() => setCurrentScreen("adminLogin")}
        />
      )}
      {currentScreen === "student" && <StudentScreen onLogout={handleLogout} />}
      {currentScreen === "admin" && <AdminScreen onLogout={handleLogout} />}
    </View>
  );
}
