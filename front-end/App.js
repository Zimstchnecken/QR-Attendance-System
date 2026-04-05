import { useEffect, useState } from "react";
import { AppState, Platform, StatusBar as NativeStatusBar, View } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import "./global.css";
import {
  SplashScreen,
  IntroScreen,
  PasswordResetScreen,
  AdminLoginScreen,
  StudentLoginScreen,
  StudentScreen,
  AdminScreen,
} from "./app/index";
import { createQrSessionPayload, validateQrSessionPayload } from "./utils/qrSession";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const schoolCode = "SCH-001";
  const [resetReturnScreen, setResetReturnScreen] = useState("adminLogin");
  const [activeQrSession, setActiveQrSession] = useState(null);
  const [consumedNonces, setConsumedNonces] = useState([]);
  const [scanEvents, setScanEvents] = useState([]);

  useEffect(() => {
    const applySystemUiVisibility = async () => {
      NativeStatusBar.setHidden(true, "slide");

      if (Platform.OS !== "android") {
        return;
      }

      try {
        await NavigationBar.setBehaviorAsync("overlay-swipe");
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setVisibilityAsync("hidden");
      } catch (error) {
        // Ignore platform-specific failures and keep app usable.
      }
    };

    applySystemUiVisibility();

    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        applySystemUiVisibility();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!activeQrSession) {
      return undefined;
    }

    const msUntilRotation = Math.max(300, activeQrSession.expiresAt - Date.now());

    const timer = setTimeout(() => {
      setActiveQrSession((prev) => {
        if (!prev) {
          return null;
        }

        const rotated = createQrSessionPayload({
          schoolCode: prev.schoolCode,
          sessionId: prev.sessionId,
          sessionName: prev.sessionName,
          nextVersion: prev.version + 1,
        });

        return {
          ...rotated,
          schoolCode: prev.schoolCode,
          sessionId: prev.sessionId,
          sessionName: prev.sessionName,
        };
      });
      setConsumedNonces([]);
    }, msUntilRotation);

    return () => clearTimeout(timer);
  }, [activeQrSession]);

  useEffect(() => {
    if (currentScreen !== "splash") {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCurrentScreen("intro");
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleAdminLogin = () => setCurrentScreen("admin");
  const handleStudentLogin = () => setCurrentScreen("student");

  const handleOpenReset = (fromScreen) => {
    setResetReturnScreen(fromScreen);
    setCurrentScreen("passwordReset");
  };

  const handleGenerateQrSession = ({ sessionId, sessionName }) => {
    const versionSeed =
      activeQrSession && activeQrSession.sessionId === sessionId ? activeQrSession.version + 1 : 1;

    const generated = createQrSessionPayload({
      schoolCode,
      sessionId,
      sessionName,
      nextVersion: versionSeed,
    });

    const nextSession = {
      ...generated,
      schoolCode,
      sessionId,
      sessionName,
    };

    setActiveQrSession(nextSession);
    setConsumedNonces([]);
    return nextSession;
  };

  const handleInvalidateQrSession = () => {
    setActiveQrSession(null);
    setConsumedNonces([]);
  };

  const handleScanQrPayload = ({ encodedPayload, studentId = "ST-078", studentName = "Student" }) => {
    const validation = validateQrSessionPayload({
      encodedPayload,
      schoolCode,
      activeQrSession,
      consumedNonces,
    });

    if (!validation.ok) {
      return {
        ok: false,
        message: validation.reason,
      };
    }

    const { payload } = validation;
    const event = {
      id: `${Date.now()}`,
      studentId,
      studentName,
      className: payload.sessionName,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString([], { month: "short", day: "2-digit" }),
      source: "qr",
    };

    setConsumedNonces((prev) => [...prev, payload.nonce]);
    setScanEvents((prev) => [event, ...prev]);

    return {
      ok: true,
      message: `${payload.sessionName} attendance confirmed.`,
      event,
    };
  };

  const handleLogout = () => {
    setCurrentScreen("adminLogin");
  };

  return (
    <View className="flex-1">
      {currentScreen === "splash" && <SplashScreen />}

      {currentScreen === "intro" && (
        <IntroScreen onSkip={() => setCurrentScreen("adminLogin")} onContinue={() => setCurrentScreen("adminLogin")} />
      )}

      {currentScreen === "passwordReset" && (
        <PasswordResetScreen
          onBack={() => setCurrentScreen(resetReturnScreen)}
          onDone={() => setCurrentScreen(resetReturnScreen)}
        />
      )}

      {currentScreen === "adminLogin" && (
        <AdminLoginScreen
          onLogin={handleAdminLogin}
          onForgotPassword={() => handleOpenReset("adminLogin")}
          onSwitchToStudent={() => setCurrentScreen("studentLogin")}
        />
      )}

      {currentScreen === "studentLogin" && (
        <StudentLoginScreen
          onLogin={handleStudentLogin}
          onForgotPassword={() => handleOpenReset("studentLogin")}
          onSwitchToAdmin={() => setCurrentScreen("adminLogin")}
        />
      )}

      {currentScreen === "student" && (
        <StudentScreen
          activeQrSession={activeQrSession}
          scanEvents={scanEvents}
          onScanQrPayload={handleScanQrPayload}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === "admin" && (
        <AdminScreen
          activeQrSession={activeQrSession}
          scanEvents={scanEvents}
          onGenerateQrSession={handleGenerateQrSession}
          onInvalidateQrSession={handleInvalidateQrSession}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}
