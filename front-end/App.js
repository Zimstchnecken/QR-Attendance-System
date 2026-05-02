import { useEffect, useState } from "react";
import { AppState, Platform, StatusBar as NativeStatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
  SectionRegistryScreen,
  SettingsScreen,
  NotificationsScreen,
  SupportScreen,
} from "./app/index";
import { loginAdmin, loginStudent, logoutUser } from "./utils/api";
import { createQrSessionPayload, validateQrSessionPayload } from "./utils/qrSession";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("splash");
  const schoolCode = "SCH-001";
  const [resetReturnScreen, setResetReturnScreen] = useState("adminLogin");
  const [activeQrSession, setActiveQrSession] = useState(null);
  const [consumedNonces, setConsumedNonces] = useState([]);
  const [scanEvents, setScanEvents] = useState([]);
  const [session, setSession] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [onUpdateStudent, setOnUpdateStudent] = useState(null);
  const [returnScreen, setReturnScreen] = useState("admin");

  useEffect(() => {
    const applySystemUiVisibility = async () => {
      NativeStatusBar.setHidden(true, "slide");

      if (Platform.OS !== "android") {
        return;
      }

      try {
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

  const handleAdminLogin = async ({ email, password }) => {
    const auth = await loginAdmin({ email, password });
    setSession(auth);
    setCurrentScreen("admin");
  };

  const handleStudentLogin = async ({ studentId, pin }) => {
    const auth = await loginStudent({ studentId, pin });
    setSession(auth);
    setCurrentScreen("student");
  };

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

  const handleScanQrPayload = ({ encodedPayload, studentId, studentName }) => {
    // Use the logged-in student's identity from session
    const resolvedStudentId = studentId || session?.user?.studentId || "ST-078";
    const resolvedStudentName = studentName || session?.user?.name || "Student";

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
      studentId: resolvedStudentId,
      studentName: resolvedStudentName,
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

  const handleLogout = async () => {
    if (session) {
      try {
        await logoutUser({ token: session.accessToken, refreshToken: session.refreshToken });
      } catch {
        // Ignore logout failures and still clear the local session.
      }
    }

    setSession(null);
    setCurrentScreen("adminLogin");
  };

  const handleUpdateSubject = (subject) => {
    setSession((prev) => ({
      ...prev,
      user: {
        ...(prev?.user || {}),
        subject: subject,
      },
    }));
  };

  return (
    <SafeAreaProvider>
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
          session={session}
          onNavigateToSettings={() => {
            setReturnScreen("student");
            setCurrentScreen("settings");
          }}
          onNavigateToNotifications={() => {
            setReturnScreen("student");
            setCurrentScreen("notifications");
          }}
          onNavigateToSupport={() => {
            setReturnScreen("student");
            setCurrentScreen("support");
          }}
        />
      )}

      {currentScreen === "admin" && (
        <AdminScreen
          activeQrSession={activeQrSession}
          scanEvents={scanEvents}
          onGenerateQrSession={handleGenerateQrSession}
          onInvalidateQrSession={handleInvalidateQrSession}
          onLogout={handleLogout}
          session={session}
          onNavigateToSettings={() => {
            setReturnScreen("admin");
            setCurrentScreen("settings");
          }}
          onNavigateToNotifications={() => {
            setReturnScreen("admin");
            setCurrentScreen("notifications");
          }}
          onNavigateToSupport={() => {
            setReturnScreen("admin");
            setCurrentScreen("support");
          }}
          onNavigateToSection={(section, list, updateFn) => {
            setSelectedSection(section);
            setStudentList(list);
            setOnUpdateStudent(() => updateFn);
            setCurrentScreen("sectionRegistry");
          }}
        />
      )}

      {currentScreen === "sectionRegistry" && (
        <SectionRegistryScreen
          section={selectedSection}
          studentList={studentList}
          onUpdateParentEmail={onUpdateStudent}
          onBack={() => setCurrentScreen("admin")}
        />
      )}
      
      {currentScreen === "settings" && (
        <SettingsScreen
          session={session}
          onBack={() => setCurrentScreen(returnScreen)}
          onLogout={handleLogout}
          onSupport={() => setCurrentScreen("support")}
          onUpdateSubject={handleUpdateSubject}
        />
      )}

      {currentScreen === "notifications" && (
        <NotificationsScreen
          onBack={() => setCurrentScreen(returnScreen)}
        />
      )}

      {currentScreen === "support" && (
        <SupportScreen
          onBack={() => setCurrentScreen(returnScreen)}
        />
      )}
      </View>
    </SafeAreaProvider>
  );
}
