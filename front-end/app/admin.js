import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ban, GraduationCap, LogOut, Mail, QrCode, CheckCircle, X, Shield, FileText, ClipboardList, AlertTriangle } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { logRows, sessionRows, studentRows } from "../data/admin";
import { theme } from "../constants/theme";

export default function AdminScreen({ onLogout }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [allowRename, setAllowRename] = useState(false);
  const [selectedSession, setSelectedSession] = useState(sessionRows[0]);
  const [sessionName, setSessionName] = useState(selectedSession.className);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [showInvalidateConfirm, setShowInvalidateConfirm] = useState(false);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [attendanceLog, setAttendanceLog] = useState(logRows);
  const [showListSummary, setShowListSummary] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [showEmergencyTemplate, setShowEmergencyTemplate] = useState(false);
  const [showTeacherAbsentTemplate, setShowTeacherAbsentTemplate] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showTeacherAbsentConfirm, setShowTeacherAbsentConfirm] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showRemoveAttendanceConfirm, setShowRemoveAttendanceConfirm] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [emailTemplate, setEmailTemplate] = useState("Dear Parent,\n\nYour child {student} has checked in for {class} at {time}.\n\nBest regards,\nSchool Administration");
  const [emergencyTemplate, setEmergencyTemplate] = useState("EMERGENCY ALERT\n\nThis is an urgent notification regarding {student} in {class}.\n\nPlease contact the school immediately.\n\nSchool Administration");
  const [teacherAbsentTemplate, setTeacherAbsentTemplate] = useState("Teacher Absent Notification\n\nDear Parent,\n\nThe teacher for {class} is absent today. Class arrangements have been made.\n\nSchool Administration");
  const successAnim = useRef(new Animated.Value(0)).current;
  const screenAnim = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  const sessionItemAnims = useRef(sessionRows.map(() => new Animated.Value(0))).current;
  const studentItemAnims = useRef(studentRows.map(() => new Animated.Value(0))).current;
  const logItemAnims = useRef(logRows.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      50,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.stagger(
      50,
      sessionItemAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.stagger(
      50,
      studentItemAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.stagger(
      50,
      logItemAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, logItemAnims, screenAnim, sessionItemAnims, studentItemAnims]);

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setSessionName(session.className);
  };

  const handleGenerateQr = () => {
    setIsGenerating(true);
    setAllowRename(true);
    qrAnim.setValue(0);
    Animated.timing(qrAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setTimeout(() => setIsGenerating(false), 400);
  };

  const handleInvalidateQr = () => {
    setShowInvalidateConfirm(true);
  };

  const handleConfirmInvalidate = () => {
    setShowInvalidateConfirm(false);
    setAllowRename(false);
    setSuccessMessage("QR session invalidated. No more check-ins allowed.");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      setSuccessMessage(`New session "${newSessionName}" created!`);
      setShowSuccessMessage(true);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1700),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowSuccessMessage(false));
      setNewSessionName("");
      setShowNewSessionForm(false);
      setSelectedSession({ id: Date.now().toString(), className: newSessionName, present: 0, total: 0, status: "Active" });
      setSessionName(newSessionName);
    }
  };

  const handleRemoveAttendance = (studentId, studentName) => {
    setStudentToRemove({ id: studentId, name: studentName });
    setShowRemoveAttendanceConfirm(true);
  };

  const handleConfirmRemoveAttendance = () => {
    if (studentToRemove) {
      setAttendanceLog(attendanceLog.filter((record) => record.id !== studentToRemove.id));
      setSuccessMessage(`${studentToRemove.name} attendance removed.`);
      setShowSuccessMessage(true);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1700),
        Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowSuccessMessage(false));
    }
    setShowRemoveAttendanceConfirm(false);
    setStudentToRemove(null);
  };

  const handleSaveEmailTemplate = () => {
    setShowEmailTemplate(false);
    setSuccessMessage("Email template saved successfully!");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleSaveEmergencyTemplate = () => {
    setShowEmergencyTemplate(false);
    setSuccessMessage("Emergency alert template saved successfully!");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleSaveTeacherAbsentTemplate = () => {
    setShowTeacherAbsentTemplate(false);
    setSuccessMessage("Teacher absent template saved successfully!");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleEmergencyAlert = () => {
    setShowEmergencyConfirm(true);
  };

  const handleConfirmEmergency = () => {
    setShowEmergencyConfirm(false);
    setSuccessMessage("🚨 Emergency alert sent to all parents!");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleTeacherAbsent = () => {
    setShowTeacherAbsentConfirm(true);
  };

  const handleConfirmTeacherAbsent = () => {
    setShowTeacherAbsentConfirm(false);
    setSuccessMessage("Teacher absence notification sent to parents.");
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

  const handleExport = (format) => {
    setShowExportOptions(false);
    
    // Generate export data
    const exportData = attendanceLog.map(log => ({
      name: log.name,
      class: log.className,
      time: log.time,
      status: 'Present'
    }));

    // In production, this would use expo-sharing or expo-file-system
    // For now, we'll show success message
    let formatName = format.toUpperCase();
    if (format === 'excel') formatName = 'Excel';
    
    setSuccessMessage(`${formatName} file exported successfully! (${attendanceLog.length} records)`);
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
    
    // Production implementation would include:
    // - CSV: Generate comma-separated values string
    // - Excel: Use 'xlsx' library to create .xlsx file
    // - PDF: Use pdf generation library
    // - Then use Sharing.shareAsync() from expo-sharing
  };

  const screenStyle = useMemo(
    () => ({
      opacity: screenAnim,
      transform: [
        {
          translateY: screenAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        },
      ],
    }),
    [screenAnim]
  );

  const cardStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <Animated.ScrollView
        className="px-6 py-6"
        contentContainerStyle={styles.scrollContent}
        style={screenStyle}
      >
        <View className="mb-6 flex-row flex-wrap items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-bold text-textPrimary font-sans">Teacher Dashboard</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">
              Manage sessions, students, and attendance exports
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.9}
            className="self-start rounded-2xl border border-border bg-card px-4 py-4"
          >
            <View className="flex-row items-center gap-2">
              <LogOut size={18} color={theme.colors.textSecondary} />
              <Text className="text-xs font-semibold text-textSecondary font-sans">Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-6 flex-row gap-3">
          <GlassCard className="flex-1" style={cardStyle(cardAnims[0])}>
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <QrCode size={18} color={theme.colors.primary} />
              </View>
              <Text
                className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Active sessions
              </Text>
            </View>
            <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">02</Text>
            <Text className="text-sm text-textSecondary font-sans">Live QR sessions</Text>
          </GlassCard>
          <GlassCard className="flex-1" style={cardStyle(cardAnims[1])}>
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <CheckCircle size={18} color={theme.colors.primary} />
              </View>
              <Text
                className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Notified
              </Text>
            </View>
            <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">97</Text>
            <Text className="text-sm text-textSecondary font-sans">Parents notified</Text>
          </GlassCard>
        </View>

        <GlassCard className="mb-6" style={cardStyle(cardAnims[2])}>
          <View className="mb-3 flex-row items-center gap-2">
            <QrCode size={20} color={theme.colors.primary} />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Active QR Session</Text>
          </View>
          <View className="mb-4 flex-row gap-2 flex-wrap">
            {sessionRows.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => handleSelectSession(session)}
                className={`rounded-2xl px-4 py-2 border ${
                  selectedSession.id === session.id
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    selectedSession.id === session.id ? "text-white" : "text-textSecondary"
                  } font-sans`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {session.className}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowNewSessionForm(!showNewSessionForm)}
              className="rounded-2xl px-3 py-2 border border-primary bg-primary/10"
            >
              <Text className="text-xs font-bold text-primary font-sans">+ New</Text>
            </TouchableOpacity>
          </View>
          {showNewSessionForm && (
            <View className="mb-4 rounded-2xl border border-border bg-card p-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
                Session Name
              </Text>
              <TextInput
                value={newSessionName}
                onChangeText={setNewSessionName}
                placeholder="e.g., Class 10A"
                placeholderTextColor="#9CA3AF"
                className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowNewSessionForm(false)}
                  className="flex-1 rounded-2xl border border-border bg-card px-3 py-2"
                >
                  <Text className="text-center text-sm font-semibold text-textPrimary font-sans">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleCreateSession}
                  className="flex-1 rounded-2xl bg-primary px-3 py-2"
                >
                  <Text className="text-center text-sm font-semibold text-white font-sans">Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View className="mb-4 rounded-2xl border border-border bg-card p-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
              Session name
            </Text>
            {allowRename ? (
              <TextInput
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="Enter class name"
                placeholderTextColor="#9CA3AF"
                className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
              />
            ) : (
              <Text className="mb-3 text-sm font-semibold text-textPrimary font-sans">{selectedSession.className}</Text>
            )}
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
              Class: {selectedSession.className}
            </Text>
            <Text className="mb-4 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
              Session ID: {selectedSession.id}
            </Text>
            <Animated.View
              className="mt-4 items-center justify-center rounded-2xl bg-surface"
              style={[
                styles.qrContainer,
                {
                  opacity: qrAnim,
                  transform: [
                    {
                      scale: qrAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <QrCode size={24} color={theme.colors.primary} />
                </View>
              )}
              {!isGenerating && (
                <Text className="mt-3 text-sm font-semibold text-textPrimary font-sans">Live QR Code</Text>
              )}
            </Animated.View>
            <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleGenerateQr}
              className="flex-1 rounded-2xl bg-primary px-4 py-4"
            >
              <View className="flex-row items-center justify-center gap-2">
                <QrCode size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Generate QR</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={handleInvalidateQr} className="flex-1 rounded-2xl bg-danger px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <Ban size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Invalidate</Text>
              </View>
            </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        <GlassCard className="mb-6" style={cardStyle(cardAnims[3])}>
          <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Today Sessions</Text>
          {sessionRows.map((row, index) => (
            <Animated.View
              key={row.id}
              className="mb-3 rounded-2xl border border-border bg-card p-4"
              style={[styles.listItem, cardStyle(sessionItemAnims[index])]}
            >
              <Text className="text-base font-semibold text-textPrimary font-sans">{row.className}</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">
                Present: {row.present}/{row.total}
              </Text>
              <Text
                className={`mt-2 text-sm font-semibold font-sans ${row.status === "Active" ? "text-success" : "text-textSecondary"}`}
              >
                {row.status}
              </Text>
            </Animated.View>
          ))}
        </GlassCard>

        <GlassCard className="mb-6" style={cardStyle(cardAnims[4])}>
          <View className="mb-3 flex-row items-center gap-2">
            <GraduationCap size={20} color={theme.colors.primary} />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Student Registry</Text>
          </View>
          {studentRows.map((row, index) => (
            <Animated.View
              key={row.id}
              className="mb-3 rounded-2xl border border-border bg-card p-4"
              style={[styles.listItem, cardStyle(studentItemAnims[index])]}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-textPrimary font-sans flex-1">{row.name}</Text>
                <View className="ml-2 rounded-lg bg-primary/10 px-2 py-1">
                  <Text className="text-xs font-semibold text-primary font-sans">{row.className || selectedSession.className}</Text>
                </View>
              </View>
              <Text className="mt-2 text-sm text-textSecondary font-sans">Student ID: {row.id}</Text>
              <Text className="text-sm text-textSecondary font-sans" numberOfLines={1} ellipsizeMode="tail">
                Parent Email: {row.parent}
              </Text>
            </Animated.View>
          ))}
          <TouchableOpacity activeOpacity={0.9} onPress={() => setShowAddStudent(!showAddStudent)} className="mt-3 rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <GraduationCap size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">
                {showAddStudent ? "Cancel" : "Add student"}
              </Text>
            </View>
          </TouchableOpacity>
          {showAddStudent && (
            <View className="mt-3 rounded-2xl border border-border bg-card p-4">
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
                Student Name
              </Text>
              <TextInput
                value={newStudentName}
                onChangeText={setNewStudentName}
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
                className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
              />
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
                Assign to Class
              </Text>
              <View className="mb-3 flex-row gap-2 flex-wrap">
                {sessionRows.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    onPress={() => setNewStudentEmail(cls.className)}
                    className={`rounded-xl px-3 py-2 border ${
                      newStudentEmail === cls.className ? "bg-primary border-primary" : "bg-card border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        newStudentEmail === cls.className ? "text-white" : "text-textSecondary"
                      } font-sans`}
                    >
                      {cls.className}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
                Parent Email
              </Text>
              <TextInput
                value={newStudentEmail}
                onChangeText={setNewStudentEmail}
                placeholder="parent@email.com"
                placeholderTextColor="#9CA3AF"
                className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
              />
              <TouchableOpacity activeOpacity={0.9} className="rounded-2xl bg-primary px-4 py-3">
                <Text className="text-center text-base font-semibold text-white font-sans">Save Student</Text>
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        <GlassCard className="mb-6" style={cardStyle(cardAnims[5])}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-textPrimary font-sans">Attendance Log (Local)</Text>
            {attendanceLog.length > 0 && (
              <View className="rounded-lg bg-success/10 px-2 py-1">
                <Text className="text-xs font-semibold text-success font-sans">{attendanceLog.length} checked in</Text>
              </View>
            )}
          </View>
          {attendanceLog.map((row, index) => (
            <Animated.View
              key={row.id}
              className="mb-3 rounded-2xl border border-border bg-card p-4"
              style={[styles.listItem, cardStyle(logItemAnims[index])]}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-textPrimary font-sans">{row.name}</Text>
                  <Text className="mt-2 text-sm text-textSecondary font-sans">{row.className}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRemoveAttendance(row.id, row.name)}
                    className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-danger/10"
                  >
                    <X size={16} color={theme.colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity activeOpacity={0.9} className="flex-1 rounded-2xl bg-primary px-4 py-4" onPress={() => setShowExportOptions(true)}>
              <View className="flex-row items-center justify-center gap-2">
                <FileText size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Export Data</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} className="flex-1 rounded-2xl bg-primary px-4 py-4" onPress={() => setShowListSummary(true)}>
              <View className="flex-row items-center justify-center gap-2">
                <ClipboardList size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">List Summary</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard style={cardStyle(cardAnims[6])}>
          <View className="mb-3 flex-row items-center gap-2">
            <Mail size={20} color={theme.colors.primary} />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Email Automation</Text>
          </View>
          <Text className="text-sm text-textSecondary font-sans">
            Parent notifications sent automatically after check-in.
          </Text>
          <TouchableOpacity activeOpacity={0.9} className="mt-4 rounded-2xl bg-primary px-4 py-4" onPress={() => setShowTemplateSelection(true)}>
            <View className="flex-row items-center justify-center gap-2">
              <Mail size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">Edit Templates</Text>
            </View>
          </TouchableOpacity>
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity activeOpacity={0.9} className="flex-1 rounded-2xl bg-danger px-4 py-4" onPress={handleEmergencyAlert}>
              <View className="flex-row items-center justify-center gap-2">
                <AlertTriangle size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Emergency Alert</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} className="flex-1 rounded-2xl bg-primary px-4 py-4" onPress={handleTeacherAbsent}>
              <View className="flex-row items-center justify-center gap-2">
                <Ban size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Teacher Absent</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.ScrollView>

      {showInvalidateConfirm && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <Text className="text-lg font-bold text-textPrimary font-sans mb-2">Invalidate Session</Text>
            <Text className="text-sm text-textSecondary font-sans mb-6">
              Are you sure you want to invalidate the QR for "{sessionName}"? This will close the session and prevent further check-ins.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowInvalidateConfirm(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmInvalidate}
                className="flex-1 rounded-2xl bg-danger px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Invalidate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showEmergencyConfirm && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                <AlertTriangle size={20} color={theme.colors.danger} />
              </View>
              <Text className="text-lg font-bold text-textPrimary font-sans">Send Emergency Alert</Text>
            </View>
            <Text className="text-sm text-textSecondary font-sans mb-6">
              This will immediately send an emergency alert to all parents in "{selectedSession.className}". Are you sure you want to proceed?
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowEmergencyConfirm(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmEmergency}
                className="flex-1 rounded-2xl bg-danger px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Send Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showRemoveAttendanceConfirm && studentToRemove && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                <X size={20} color={theme.colors.danger} />
              </View>
              <Text className="text-lg font-bold text-textPrimary font-sans">Remove Attendance</Text>
            </View>
            <Text className="text-sm text-textSecondary font-sans mb-6">
              Remove {studentToRemove.name}'s attendance record? This action cannot be undone.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  setShowRemoveAttendanceConfirm(false);
                  setStudentToRemove(null);
                }}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmRemoveAttendance}
                className="flex-1 rounded-2xl bg-danger px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showTeacherAbsentConfirm && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-3 flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Ban size={20} color={theme.colors.primary} />
              </View>
              <Text className="text-lg font-bold text-textPrimary font-sans">Notify Teacher Absence</Text>
            </View>
            <Text className="text-sm text-textSecondary font-sans mb-6">
              Send absence notification for "{selectedSession.className}" to all parents? They will be informed about class arrangements.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowTeacherAbsentConfirm(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmTeacherAbsent}
                className="flex-1 rounded-2xl bg-primary px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Send Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showTemplateSelection && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-textPrimary font-sans">Choose Template</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowTemplateSelection(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="mb-4 text-sm text-textSecondary font-sans">Select which template you want to edit</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowTemplateSelection(false);
                setShowEmailTemplate(true);
              }}
              className="mb-3 rounded-2xl bg-primary px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Mail size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">Email Template</Text>
                  <Text className="text-xs text-white/80 font-sans">Check-in notification to parents</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowTemplateSelection(false);
                setShowEmergencyTemplate(true);
              }}
              className="mb-3 rounded-2xl bg-danger px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <AlertTriangle size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">Emergency Alert</Text>
                  <Text className="text-xs text-white/80 font-sans">Urgent notification template</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setShowTemplateSelection(false);
                setShowTeacherAbsentTemplate(true);
              }}
              className="rounded-2xl bg-primary px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Ban size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">Teacher Absent</Text>
                  <Text className="text-xs text-white/80 font-sans">Absence notification template</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showEmailTemplate && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-textPrimary font-sans">Email Template</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowEmailTemplate(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Template Content</Text>
            <Text className="mb-4 text-xs text-textSecondary font-sans">Use placeholders: {'{student}'}, {'{class}'}, {'{time}'}</Text>
            <TextInput
              value={emailTemplate}
              onChangeText={setEmailTemplate}
              placeholder="Enter email template"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={8}
              className="mb-4 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-textPrimary font-sans"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowEmailTemplate(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveEmailTemplate}
                className="flex-1 rounded-2xl bg-primary px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Save Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showEmergencyTemplate && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-textPrimary font-sans">Emergency Alert</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowEmergencyTemplate(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Alert Message</Text>
            <Text className="mb-4 text-xs text-textSecondary font-sans">Use placeholders: {'{student}'}, {'{class}'}</Text>
            <TextInput
              value={emergencyTemplate}
              onChangeText={setEmergencyTemplate}
              placeholder="Enter emergency alert template"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={8}
              className="mb-4 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-textPrimary font-sans"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowEmergencyTemplate(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveEmergencyTemplate}
                className="flex-1 rounded-2xl bg-danger px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Save Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showTeacherAbsentTemplate && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-textPrimary font-sans">Teacher Absent</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowTeacherAbsentTemplate(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Notification Message</Text>
            <Text className="mb-4 text-xs text-textSecondary font-sans">Use placeholder: {'{class}'}</Text>
            <TextInput
              value={teacherAbsentTemplate}
              onChangeText={setTeacherAbsentTemplate}
              placeholder="Enter teacher absent notification"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={8}
              className="mb-4 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-textPrimary font-sans"
              style={{ textAlignVertical: 'top' }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setShowTeacherAbsentTemplate(false)}
                className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSaveTeacherAbsentTemplate}
                className="flex-1 rounded-2xl bg-primary px-4 py-3"
              >
                <Text className="text-center text-base font-semibold text-white font-sans">Save Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showSuccessMessage && (
        <Animated.View
          className="pointer-events-none absolute inset-0 justify-start items-center pt-12"
          style={{ opacity: successAnim }}
        >
          <View className="mx-6 w-full rounded-2xl bg-card border border-success/20 px-5 py-4 shadow-lg"
            style={{
              shadowColor: theme.colors.success,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle size={24} color={theme.colors.success} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-success font-sans">{successMessage}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {showExportOptions && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <FileText size={20} color={theme.colors.primary} />
                <Text className="text-lg font-bold text-textPrimary font-sans">Export Format</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowExportOptions(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="mb-4 text-sm text-textSecondary font-sans">Choose your preferred export format for {attendanceLog.length} attendance records</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleExport('csv')}
              className="mb-3 rounded-2xl bg-primary px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <FileText size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">CSV File</Text>
                  <Text className="text-xs text-white/80 font-sans">Comma-separated values (.csv)</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleExport('excel')}
              className="mb-3 rounded-2xl bg-success px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <FileText size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">Excel Spreadsheet</Text>
                  <Text className="text-xs text-white/80 font-sans">Microsoft Excel format (.xlsx)</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleExport('pdf')}
              className="rounded-2xl bg-danger px-4 py-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <FileText size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white font-sans">PDF Document</Text>
                  <Text className="text-xs text-white/80 font-sans">Portable document format (.pdf)</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showListSummary && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="w-full rounded-2xl bg-card p-6 max-h-96">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <ClipboardList size={20} color={theme.colors.primary} />
                <Text className="text-lg font-bold text-textPrimary font-sans">Summary: {selectedSession.className}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowListSummary(false)}>
                <Text className="text-2xl text-textSecondary font-sans">✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="mb-4">
              {attendanceLog.length > 0 ? (
                <View>
                  {attendanceLog.map((row, index) => (
                    <View key={row.id} className={`py-3 ${index > 0 ? 'border-t border-border' : ''}`}>
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-textPrimary font-sans">{row.name}</Text>
                          <Text className="text-xs text-textSecondary font-sans">{row.className}</Text>
                        </View>
                        <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-sm text-textSecondary font-sans text-center py-4">No students checked in yet</Text>
              )}
            </ScrollView>
            <View className="border-t border-border pt-3 mb-4">
              <Text className="text-sm font-semibold text-textSecondary font-sans">Total: {attendanceLog.length} students present</Text>
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setShowListSummary(false)} className="rounded-2xl bg-primary px-4 py-3">
              <Text className="text-center text-base font-semibold text-white font-sans">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  shrinkText: {
    flexShrink: 1,
  },
  listItem: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    minHeight: 44,
  },
  qrContainer: {
    height: 224,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
  },
});
