import { useEffect, useMemo, useState } from "react";
import { Animated, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ClipboardList, FileText, House, QrCode, Users } from "lucide-react-native";
import { ScreenBackground } from "../components";
import { theme } from "../constants/theme";
import { useAdminHandlers, useAdminState } from "../components/admin/hooks";
import {
  InvalidateConfirmModal,
  EmergencyConfirmModal,
  ClassEndedConfirmModal,
  EmailTemplateModal,
  EmergencyTemplateModal,
  ListSummaryModal,
  RemoveAttendanceModal,
  SuccessToast,
  TeacherAbsentConfirmModal,
  TeacherAbsentTemplateModal,
  TemplateSelectionModal,
  ClassEndedTemplateModal,
  ExportOptionsModal,
  WarningModal,
} from "../components/admin/modals";
import {
  ActiveQrSessionCard,
  DashboardAnalyticsCard,
  AttendanceLogCard,
  DashboardHeader,
  DashboardTabBar,
  EmailAutomationCard,
  StudentRegistryCard,
  SummaryCards,
  TodaySessionsCard,
} from "../components/admin/sections";

const DASHBOARD_TABS = [
  { key: "home", label: "Dashboard", icon: House },
  { key: "sessions", label: "Sessions", icon: ClipboardList },
  { key: "liveQr", label: "Live QR", icon: QrCode },
  { key: "students", label: "Registry", icon: Users },
  { key: "attendance", label: "Logs", icon: FileText },
];

const TAB_META = {
  home: {
    title: "Dashboard",
    subtitle: "Overview for roll-call snapshots and quick insights.",
    badge: "Overview",
  },
  sessions: {
    title: "Session Management",
    subtitle: "Create classes and track session lifecycle for the day.",
    badge: "Sessions",
  },
  liveQr: {
    title: "Live QR Control",
    subtitle: "Generate rotating QR and invalidate sessions when needed.",
    badge: "Security",
  },
  students: {
    title: "Student Registry",
    subtitle: "Manage student records and class assignment data.",
    badge: "Roster",
  },
  attendance: {
    title: "Attendance Logs",
    subtitle: "Review check-ins, remove mistakes, and export records.",
    badge: "Records",
  },
};

export default function AdminScreen({
  activeQrSession,
  scanEvents,
  onGenerateQrSession,
  onInvalidateQrSession,
  onLogout,
}) {
  const state = useAdminState();
  const handlers = useAdminHandlers(state, {
    onGenerateLiveQr: onGenerateQrSession,
    onInvalidateLiveQr: onInvalidateQrSession,
  });
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [activeTab, setActiveTab] = useState("home");

  const {
    isGenerating,
    allowRename,
    selectedSession,
    sessionName,
    showAddStudent,
    newStudentName,
    newStudentEmail,
    newStudentClass,
    showInvalidateConfirm,
    showNewSessionForm,
    newSessionName,
    showSuccessMessage,
    successMessage,
    attendanceLog,
    showListSummary,
    showTemplateSelection,
    showEmailTemplate,
    showEmergencyTemplate,
    showTeacherAbsentTemplate,
    showClassEndedTemplate,
    showEmergencyConfirm,
    showTeacherAbsentConfirm,
    showClassEndedConfirm,
    showExportOptions,
    showRemoveAttendanceConfirm,
    studentToRemove,
    showWarning,
    warningMessage,
    emailTemplate,
    emergencyTemplate,
    teacherAbsentTemplate,
    classEndedTemplate,
    successAnim,
    screenAnim,
    qrAnim,
    cardAnims,
    sessionItemAnims,
    studentItemAnims,
    logItemAnims,
    setShowNewSessionForm,
    setNewSessionName,
    setSessionName,
    setShowAddStudent,
    setNewStudentName,
    setNewStudentClass,
    setNewStudentEmail,
    setShowInvalidateConfirm,
    setShowRemoveAttendanceConfirm,
    setStudentToRemove,
    setShowTemplateSelection,
    setShowEmailTemplate,
    setShowEmergencyTemplate,
    setShowTeacherAbsentTemplate,
    setShowClassEndedTemplate,
    setShowEmergencyConfirm,
    setShowTeacherAbsentConfirm,
    setShowClassEndedConfirm,
    setShowExportOptions,
    setShowListSummary,
    setShowWarning,
    setEmailTemplate,
    setEmergencyTemplate,
    setTeacherAbsentTemplate,
    setClassEndedTemplate,
  } = state;

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

  const scrollPadding = useMemo(
    () => ({
      paddingHorizontal: isCompact ? theme.spacing.md : theme.spacing.lg,
      paddingTop: isCompact ? theme.spacing.md : theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    }),
    [isCompact]
  );

  const activeTabMeta = TAB_META[activeTab];
  const liveScanRows = useMemo(
    () =>
      (scanEvents || []).map((event) => ({
        id: `LIVE-${event.id}`,
        name: event.studentName,
        className: event.className,
        time: event.time,
      })),
    [scanEvents]
  );
  const mergedAttendanceLog = useMemo(
    () => [...liveScanRows, ...attendanceLog],
    [attendanceLog, liveScanRows]
  );

  const renderTabContent = () => {
    if (activeTab === "home") {
      return (
        <>
          <SummaryCards cardStyle={cardStyle} cardAnims={cardAnims} />
          <DashboardAnalyticsCard
            cardStyle={cardStyle}
            cardAnim={cardAnims[2]}
            attendanceLog={mergedAttendanceLog}
            selectedSession={selectedSession}
          />
        </>
      );
    }

    if (activeTab === "sessions") {
      return (
        <TodaySessionsCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[3]}
          sessionItemAnims={sessionItemAnims}
          listItemStyle={styles.listItem}
        />
      );
    }

    if (activeTab === "liveQr") {
      return (
        <ActiveQrSessionCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[4]}
          selectedSession={selectedSession}
          handleSelectSession={handlers.handleSelectSession}
          showNewSessionForm={showNewSessionForm}
          setShowNewSessionForm={setShowNewSessionForm}
          newSessionName={newSessionName}
          setNewSessionName={setNewSessionName}
          handleCreateSession={handlers.handleCreateSession}
          allowRename={allowRename}
          sessionName={sessionName}
          setSessionName={setSessionName}
          isGenerating={isGenerating}
          activeQrSession={activeQrSession}
          qrAnim={qrAnim}
          handleGenerateQr={handlers.handleGenerateQr}
          handleInvalidateQr={handlers.handleInvalidateQr}
          styles={styles}
        />
      );
    }

    if (activeTab === "students") {
      return (
        <StudentRegistryCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[5]}
          studentItemAnims={studentItemAnims}
          selectedSession={selectedSession}
          showAddStudent={showAddStudent}
          setShowAddStudent={setShowAddStudent}
          newStudentName={newStudentName}
          setNewStudentName={setNewStudentName}
          newStudentClass={newStudentClass}
          setNewStudentClass={setNewStudentClass}
          newStudentEmail={newStudentEmail}
          setNewStudentEmail={setNewStudentEmail}
          handleSaveStudent={handlers.handleSaveStudent}
          listItemStyle={styles.listItem}
        />
      );
    }

    return (
      <>
        <AttendanceLogCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[6]}
          attendanceLog={mergedAttendanceLog}
          logItemAnims={logItemAnims}
          handleRemoveAttendance={handlers.handleRemoveAttendance}
          setShowExportOptions={setShowExportOptions}
          setShowListSummary={setShowListSummary}
          listItemStyle={styles.listItem}
        />
        <EmailAutomationCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[6]}
          setShowTemplateSelection={setShowTemplateSelection}
          handleEmergencyAlert={handlers.handleEmergencyAlert}
          handleTeacherAbsent={handlers.handleTeacherAbsent}
          handleClassEnded={handlers.handleClassEnded}
        />
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, scrollPadding]}
        style={[styles.scrollView, screenStyle]}
      >
        <DashboardHeader onLogout={onLogout} />

        <View className="mb-5 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactPageHeader : null}>
          <View className="flex-1 pr-2" style={isCompact ? styles.compactPageHeaderText : null}>
            <Text className="text-xl font-bold text-textPrimary font-sans">{activeTabMeta.title}</Text>
            <Text className="mt-1 text-sm text-textSecondary font-sans">{activeTabMeta.subtitle}</Text>
          </View>
          <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
            <Text className="text-xs font-semibold text-primary font-sans">{activeTabMeta.badge}</Text>
          </View>
        </View>

        {renderTabContent()}
      </Animated.ScrollView>

      <DashboardTabBar tabs={DASHBOARD_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <InvalidateConfirmModal
        visible={showInvalidateConfirm}
        sessionName={sessionName}
        onCancel={() => setShowInvalidateConfirm(false)}
        onConfirm={handlers.handleConfirmInvalidate}
      />

      <RemoveAttendanceModal
        visible={showRemoveAttendanceConfirm}
        studentToRemove={studentToRemove}
        onCancel={() => {
          setShowRemoveAttendanceConfirm(false);
          setStudentToRemove(null);
        }}
        onConfirm={handlers.handleConfirmRemoveAttendance}
      />

      <EmergencyConfirmModal
        visible={showEmergencyConfirm}
        sessionName={selectedSession.className}
        onCancel={() => setShowEmergencyConfirm(false)}
        onConfirm={handlers.handleConfirmEmergency}
      />

      <TeacherAbsentConfirmModal
        visible={showTeacherAbsentConfirm}
        sessionName={selectedSession.className}
        onCancel={() => setShowTeacherAbsentConfirm(false)}
        onConfirm={handlers.handleConfirmTeacherAbsent}
      />

      <ClassEndedConfirmModal
        visible={showClassEndedConfirm}
        sessionName={selectedSession.className}
        onCancel={() => setShowClassEndedConfirm(false)}
        onConfirm={handlers.handleConfirmClassEnded}
      />

      <TemplateSelectionModal
        visible={showTemplateSelection}
        onClose={() => setShowTemplateSelection(false)}
        onSelectEmail={() => {
          setShowTemplateSelection(false);
          setShowEmailTemplate(true);
        }}
        onSelectEmergency={() => {
          setShowTemplateSelection(false);
          setShowEmergencyTemplate(true);
        }}
        onSelectTeacherAbsent={() => {
          setShowTemplateSelection(false);
          setShowTeacherAbsentTemplate(true);
        }}
        onSelectClassEnded={() => {
          setShowTemplateSelection(false);
          setShowClassEndedTemplate(true);
        }}
      />

      <EmailTemplateModal
        visible={showEmailTemplate}
        value={emailTemplate}
        onChange={setEmailTemplate}
        onCancel={() => setShowEmailTemplate(false)}
        onSave={handlers.handleSaveEmailTemplate}
      />

      <EmergencyTemplateModal
        visible={showEmergencyTemplate}
        value={emergencyTemplate}
        onChange={setEmergencyTemplate}
        onCancel={() => setShowEmergencyTemplate(false)}
        onSave={handlers.handleSaveEmergencyTemplate}
      />

      <TeacherAbsentTemplateModal
        visible={showTeacherAbsentTemplate}
        value={teacherAbsentTemplate}
        onChange={setTeacherAbsentTemplate}
        onCancel={() => setShowTeacherAbsentTemplate(false)}
        onSave={handlers.handleSaveTeacherAbsentTemplate}
      />

      <ClassEndedTemplateModal
        visible={showClassEndedTemplate}
        value={classEndedTemplate}
        onChange={setClassEndedTemplate}
        onCancel={() => setShowClassEndedTemplate(false)}
        onSave={handlers.handleSaveClassEndedTemplate}
      />

      <SuccessToast visible={showSuccessMessage} successAnim={successAnim} message={successMessage} />

      <ExportOptionsModal
        visible={showExportOptions}
        attendanceCount={mergedAttendanceLog.length}
        onClose={() => setShowExportOptions(false)}
        onExport={handlers.handleExport}
      />

      <ListSummaryModal
        visible={showListSummary}
        attendanceLog={mergedAttendanceLog}
        sessionName={selectedSession.className}
        onClose={() => setShowListSummary(false)}
      />

      <WarningModal visible={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  compactPageHeader: {
    alignItems: "stretch",
  },
  compactPageHeaderText: {
    flexBasis: "100%",
    paddingRight: 0,
  },
  compactBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
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
