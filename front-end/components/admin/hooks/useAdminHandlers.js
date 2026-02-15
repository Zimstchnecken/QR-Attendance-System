import { Animated } from "react-native";

export const useAdminHandlers = (state) => {
  const {
    successAnim,
    qrAnim,
    setIsGenerating,
    setAllowRename,
    setSelectedSession,
    setSessionName,
    setNewSessionName,
    setShowNewSessionForm,
    setSuccessMessage,
    setShowSuccessMessage,
    setShowInvalidateConfirm,
    setStudentToRemove,
    setShowRemoveAttendanceConfirm,
    setAttendanceLog,
    attendanceLog,
    studentToRemove,
    setNewStudentName,
    setNewStudentEmail,
    setNewStudentClass,
    setShowAddStudent,
    setWarningMessage,
    setShowWarning,
    newStudentName,
    newStudentClass,
    newStudentEmail,
    newSessionName,
    setShowEmailTemplate,
    setShowEmergencyTemplate,
    setShowTeacherAbsentTemplate,
    setShowEmergencyConfirm,
    setShowTeacherAbsentConfirm,
    setShowExportOptions,
  } = state;

  const showSuccessWithAnimation = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccessMessage(false));
  };

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
    showSuccessWithAnimation("QR session invalidated. No more check-ins allowed.");
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      showSuccessWithAnimation(`New session "${newSessionName}" created!`);
      setNewSessionName("");
      setShowNewSessionForm(false);
      setSelectedSession({
        id: Date.now().toString(),
        className: newSessionName,
        present: 0,
        total: 0,
        status: "Active",
      });
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
      showSuccessWithAnimation(`${studentToRemove.name} attendance removed.`);
    }
    setShowRemoveAttendanceConfirm(false);
    setStudentToRemove(null);
  };

  const handleSaveStudent = () => {
    if (!newStudentName.trim()) {
      setWarningMessage("Please enter the student's name.");
      setShowWarning(true);
      return;
    }
    if (!newStudentClass) {
      setWarningMessage("Please assign the student to a class.");
      setShowWarning(true);
      return;
    }
    if (!newStudentEmail.trim()) {
      setWarningMessage("Please enter the parent's email address.");
      setShowWarning(true);
      return;
    }

    showSuccessWithAnimation(`${newStudentName} added to student registry!`);
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentClass("");
    setShowAddStudent(false);
  };

  const handleSaveEmailTemplate = () => {
    setShowEmailTemplate(false);
    showSuccessWithAnimation("Email template saved successfully!");
  };

  const handleSaveEmergencyTemplate = () => {
    setShowEmergencyTemplate(false);
    showSuccessWithAnimation("Emergency alert template saved successfully!");
  };

  const handleSaveTeacherAbsentTemplate = () => {
    setShowTeacherAbsentTemplate(false);
    showSuccessWithAnimation("Teacher absent template saved successfully!");
  };

  const handleEmergencyAlert = () => {
    setShowEmergencyConfirm(true);
  };

  const handleConfirmEmergency = () => {
    setShowEmergencyConfirm(false);
    showSuccessWithAnimation("🚨 Emergency alert sent to all parents!");
  };

  const handleTeacherAbsent = () => {
    setShowTeacherAbsentConfirm(true);
  };

  const handleConfirmTeacherAbsent = () => {
    setShowTeacherAbsentConfirm(false);
    showSuccessWithAnimation("Teacher absence notification sent to parents.");
  };

  const handleExport = (format) => {
    setShowExportOptions(false);

    // Generate export data
    const exportData = attendanceLog.map((log) => ({
      name: log.name,
      class: log.className,
      time: log.time,
      status: "Present",
    }));

    let formatName = format.toUpperCase();
    if (format === "excel") formatName = "Excel";

    showSuccessWithAnimation(
      `${formatName} file exported successfully! (${attendanceLog.length} records)`
    );
  };

  return {
    handleSelectSession,
    handleGenerateQr,
    handleInvalidateQr,
    handleConfirmInvalidate,
    handleCreateSession,
    handleRemoveAttendance,
    handleConfirmRemoveAttendance,
    handleSaveStudent,
    handleSaveEmailTemplate,
    handleSaveEmergencyTemplate,
    handleSaveTeacherAbsentTemplate,
    handleEmergencyAlert,
    handleConfirmEmergency,
    handleTeacherAbsent,
    handleConfirmTeacherAbsent,
    handleExport,
  };
};
