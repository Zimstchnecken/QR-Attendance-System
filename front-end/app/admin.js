import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { ClipboardList, FileText, House, QrCode, Users } from "lucide-react-native";
import { ScreenBackground } from "../components";
import { theme } from "../constants/theme";
import { useAdminHandlers, useAdminState } from "../components/admin/hooks";
import { fetchAttendanceRecords } from "../utils/api";
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
  AddStudentModal,
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
  session,
  onNavigateToSection,
  onNavigateToSettings,
  onNavigateToNotifications,
}) {
  const state = useAdminState(session?.accessToken);
  const handlers = useAdminHandlers(state, {
    onGenerateLiveQr: onGenerateQrSession,
    onInvalidateLiveQr: onInvalidateQrSession,
  }, session?.accessToken, session?.user?.name ?? "Admin");
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [activeTab, setActiveTab] = useState("home");
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedSectionForEnrollment, setSelectedSectionForEnrollment] = useState(null);

  const {
    isLoading,
    loadError,
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

  // Fetch attendance records whenever the selected session changes
  useEffect(() => {
    if (!selectedSession?.id || !session?.accessToken) return;

    let cancelled = false;

    (async () => {
      try {
        const records = await fetchAttendanceRecords(selectedSession.id, session.accessToken);
        if (cancelled) return;

        const mapped = (records || []).map((r) => {
          // Look up student name in the registry if available
          const studentInfo = state.studentList.find(s => s.id === r.studentId || s.studentId === r.studentId);
          return {
            id: r.recordId ?? `${r.studentId}-${r.recordedAt}`,
            name: studentInfo ? studentInfo.name : r.studentId,
            className: selectedSession.className,
            time: new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
            status: r.status,
          };
        });

        state.setAttendanceLog(mapped);
      } catch {
        // Non-fatal — keep existing log
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSession?.id, session?.accessToken]);

  // These must be declared before any early returns to satisfy Rules of Hooks
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

  const activeTabMeta = TAB_META[activeTab];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={styles.centered}>
        <ScreenBackground />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-sm text-textSecondary font-sans">Loading dashboard…</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView className="flex-1 bg-background" style={styles.centered}>
        <ScreenBackground />
        <Text className="text-base font-semibold text-danger font-sans">Failed to load data</Text>
        <Text className="mt-2 text-sm text-textSecondary font-sans">{loadError}</Text>
        <TouchableOpacity
          onPress={state.reload}
          className="mt-6 rounded-2xl bg-primary px-6 py-3"
        >
          <Text className="text-sm font-semibold text-white font-sans">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderTabContent = () => {
    if (activeTab === "home") {
      return (
        <>
          <SummaryCards cardStyle={cardStyle} cardAnims={cardAnims} sessions={state.sessions} attendanceLog={mergedAttendanceLog} />
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
          sessions={state.sessions}
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
          sessions={state.sessions}
          sectionList={state.sectionList}
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
          session={session}
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
          studentList={state.studentList}
          sectionList={state.sectionList}
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
          onUpdateParentEmail={handlers.handleUpdateParentEmail}
          onOpenAddStudentModal={() => {
            // Pick the first section by default; the modal has a section selector
            const firstSection = state.sectionList?.[0];
            setShowAddStudentModal(true);
            setSelectedSectionForEnrollment(
              firstSection
                ? { id: firstSection.id, name: firstSection.name }
                : { id: '', name: 'Current Section' }
            );
          }}
          onImportStudents={handlers.handleImportStudents}
          onDownloadTemplate={handlers.handleDownloadTemplate}
          onNavigateToSection={(section) => 
            onNavigateToSection(section, state.studentList, handlers.handleUpdateParentEmail)
          }
          onUpdateParentEmail={handlers.handleUpdateParentEmail}
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
          studentList={state.studentList}
          sectionList={state.sectionList}
          selectedSession={selectedSession}
          logItemAnims={logItemAnims}
          handleRemoveAttendance={handlers.handleRemoveAttendance}
          handleAddAttendanceStudent={handlers.handleAddAttendanceStudent}
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
        <DashboardHeader 
          onLogout={onLogout} 
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToNotifications={onNavigateToNotifications}
          teachingSubject={session?.user?.subject}
        />

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
        onExport={(format) => handlers.handleExport(format, mergedAttendanceLog)}
      />

      <ListSummaryModal
        visible={showListSummary}
        attendanceLog={mergedAttendanceLog}
        sessionName={selectedSession.className}
        onExport={() => handlers.handleExport("pdf", mergedAttendanceLog)}
        onClose={() => setShowListSummary(false)}
      />

      <WarningModal visible={showWarning} message={warningMessage} onClose={() => setShowWarning(false)} />

      {selectedSectionForEnrollment && (
        <AddStudentModal
          visible={showAddStudentModal}
          sectionId={selectedSectionForEnrollment.id}
          sectionName={selectedSectionForEnrollment.name}
          sections={state.sectionList || []}
          onSectionChange={(section) => setSelectedSectionForEnrollment({ id: section.id, name: section.name })}
          onClose={() => {
            setShowAddStudentModal(false);
            setSelectedSectionForEnrollment(null);
          }}
          onEnroll={(studentId, studentName) => {
            handlers.showSuccessWithAnimation?.(`${studentName} added to ${selectedSectionForEnrollment.name}!`);
          }}
          apiBaseUrl={process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001'}
          authToken={session?.accessToken}
        />
      )}
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
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
