import { useEffect, useMemo } from "react";
import { Animated, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { ScreenBackground } from "../components";
import { theme } from "../constants/theme";
import { useAdminHandlers, useAdminState } from "../components/admin/hooks";
import {
  ClassEndedConfirmModal,
  ClassEndedTemplateModal,
  EmergencyConfirmModal,
  EmailTemplateModal,
  ExportOptionsModal,
  InvalidateConfirmModal,
  ListSummaryModal,
  RemoveAttendanceModal,
  SuccessToast,
  TeacherAbsentConfirmModal,
  TeacherAbsentTemplateModal,
  TemplateSelectionModal,
  WarningModal,
  EmergencyTemplateModal,
} from "../components/admin/modals";
import {
  ActiveQrSessionCard,
  AttendanceLogCard,
  DashboardHeader,
  EmailAutomationCard,
  StudentRegistryCard,
  SummaryCards,
  TodaySessionsCard,
} from "../components/admin/sections";

export default function AdminScreen({ onLogout }) {
  const state = useAdminState();
  const handlers = useAdminHandlers(state);

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
    setShowEmergencyConfirm,
    setShowTeacherAbsentConfirm,
    setShowClassEndedConfirm,
    setShowRemoveAttendanceConfirm,
    setStudentToRemove,
    setShowTemplateSelection,
    setShowEmailTemplate,
    setShowEmergencyTemplate,
    setShowTeacherAbsentTemplate,
    setShowClassEndedTemplate,
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <Animated.ScrollView
        className="px-6 py-6"
        contentContainerStyle={styles.scrollContent}
        style={screenStyle}
      >
        <DashboardHeader onLogout={onLogout} />
        <SummaryCards cardStyle={cardStyle} cardAnims={cardAnims} />
        <ActiveQrSessionCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[2]}
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
          qrAnim={qrAnim}
          handleGenerateQr={handlers.handleGenerateQr}
          handleInvalidateQr={handlers.handleInvalidateQr}
          styles={styles}
        />
        <TodaySessionsCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[3]}
          sessionItemAnims={sessionItemAnims}
          listItemStyle={styles.listItem}
        />
        <StudentRegistryCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[4]}
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
        <AttendanceLogCard
          cardStyle={cardStyle}
          cardAnim={cardAnims[5]}
          attendanceLog={attendanceLog}
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
      </Animated.ScrollView>

      <InvalidateConfirmModal
        visible={showInvalidateConfirm}
        sessionName={sessionName}
        onCancel={() => setShowInvalidateConfirm(false)}
        onConfirm={handlers.handleConfirmInvalidate}
      />
      <EmergencyConfirmModal
        visible={showEmergencyConfirm}
        sessionName={selectedSession.className}
        onCancel={() => setShowEmergencyConfirm(false)}
        onConfirm={handlers.handleConfirmEmergency}
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
        attendanceCount={attendanceLog.length}
        onClose={() => setShowExportOptions(false)}
        onExport={handlers.handleExport}
      />
      <ListSummaryModal
        visible={showListSummary}
        attendanceLog={attendanceLog}
        sessionName={selectedSession.className}
        onClose={() => setShowListSummary(false)}
      />
      <WarningModal
        visible={showWarning}
        message={warningMessage}
        onClose={() => setShowWarning(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
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
