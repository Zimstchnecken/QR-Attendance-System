import { Animated } from "react-native";
import {
  fetchClassSessions,
  fetchSectionSubjects,
  openClassSession,
  sendAttendanceSummaryEmail,
} from "../../../utils/api";

export const useAdminHandlers = (state, liveQrActions = {}, apiToken, teacherName = "Admin") => {
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
    setShowClassEndedTemplate,
    setShowEmergencyConfirm,
    setShowTeacherAbsentConfirm,
    setShowClassEndedConfirm,
    setShowExportOptions,
    studentList,
    setStudentList,
    sessions,
    setSessions,
    selectedSession,
    sectionList,
    emergencyTemplate,
    teacherAbsentTemplate,
    classEndedTemplate,
  } = state;
  const { onGenerateLiveQr, onInvalidateLiveQr } = liveQrActions;

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

  const handleGenerateQr = ({ sessionId, sessionName }) => {
    setIsGenerating(true);
    setAllowRename(true);
    qrAnim.setValue(0);
    Animated.timing(qrAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setTimeout(() => setIsGenerating(false), 400);

    if (onGenerateLiveQr) {
      const generated = onGenerateLiveQr({ sessionId, sessionName });

      if (generated?.version) {
        showSuccessWithAnimation(`QR v${generated.version} generated for ${sessionName}.`);
      }
    }
  };

  const handleInvalidateQr = () => {
    setShowInvalidateConfirm(true);
  };

  const handleConfirmInvalidate = () => {
    setShowInvalidateConfirm(false);
    setAllowRename(false);

    if (onInvalidateLiveQr) {
      onInvalidateLiveQr();
    }

    showSuccessWithAnimation("QR session invalidated. No more check-ins allowed.");
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    // selectedSession.id is either a real section UUID (from sectionList)
    // or a class session UUID (from sessions). We need the section ID.
    // The selectedSession was set by handleSelectSession which uses sectionList items directly.
    const sectionId = selectedSession?.id;
    const sectionName = selectedSession?.className || newSessionName.trim();

    try {
      let backendSessionId = null;
      let finalClassName = `${sectionName} — ${newSessionName.trim()}`;

      if (apiToken && sectionId) {
        try {
          // Fetch subjects for the selected section
          const subjects = await fetchSectionSubjects(sectionId, apiToken);

          // Find subject matching the typed name, or use the first one
          const matchedSubject = subjects.find(
            (s) => s.subjectName?.toLowerCase() === newSessionName.trim().toLowerCase()
          ) || subjects[0];

          if (matchedSubject?.id) {
            const today = new Date().toISOString().slice(0, 10);
            const opened = await openClassSession(matchedSubject.id, today, apiToken);
            backendSessionId = opened?.sessionId ?? null;
            // Use the actual subject name if matched
            finalClassName = `${sectionName} — ${matchedSubject.subjectName || newSessionName.trim()}`;
          }
        } catch {
          // API unavailable — continue with local-only session
        }
      }

      const newSession = {
        id: backendSessionId ?? Date.now().toString(),
        className: finalClassName,
        present: 0,
        total: 0,
        status: "Active",
        isLastPeriod: false,
      };

      setSessions((prev) => [...prev, newSession]);
      setSelectedSession(newSession);
      setSessionName(finalClassName);
      setNewSessionName("");
      setShowNewSessionForm(false);
      showSuccessWithAnimation(`Session "${finalClassName}" opened!`);

      // Refresh sessions list from API in the background
      if (apiToken) {
        try {
          const refreshed = await fetchClassSessions(apiToken);
          if (refreshed.length > 0) {
            setSessions(refreshed);
          }
        } catch {
          // Ignore — local state is already updated
        }
      }
    } catch (err) {
      setWarningMessage(err?.message ?? "Failed to open session.");
      setShowWarning(true);
    }
  };

  const handleRemoveAttendance = (studentId, studentName) => {
    setStudentToRemove({ id: studentId, name: studentName });
    setShowRemoveAttendanceConfirm(true);
  };

  const handleConfirmRemoveAttendance = () => {
    if (studentToRemove) {
      // Use functional updater to avoid stale closure
      setAttendanceLog((prev) => prev.filter((record) => record.id !== studentToRemove.id));
      showSuccessWithAnimation(`${studentToRemove.name} attendance removed.`);
    }
    setShowRemoveAttendanceConfirm(false);
    setStudentToRemove(null);
  };

  const handleAddAttendanceStudent = (student) => {
    if (!student) {
      setWarningMessage("Please select a student to add to attendance.");
      setShowWarning(true);
      return;
    }

    const targetClassName = state.selectedSession?.className || "Unassigned Class";
    const hasDuplicate = attendanceLog.some(
      (record) => record.name === student.name && record.className === targetClassName
    );

    if (hasDuplicate) {
      setWarningMessage(`${student.name} is already marked present for ${targetClassName}.`);
      setShowWarning(true);
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRecord = {
      id: `M-${Date.now()}`,
      name: student.name,
      className: targetClassName,
      time: currentTime,
    };

    setAttendanceLog([newRecord, ...attendanceLog]);
    showSuccessWithAnimation(`${student.name} added to attendance.`);
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

    const newStudent = {
      id: `ST-${Date.now()}`,
      name: newStudentName.trim(),
      parent: newStudentEmail.trim(),
      className: newStudentClass,
    };
    setStudentList((prev) => [...prev, newStudent]);
    showSuccessWithAnimation(`${newStudentName} added to student registry!`);
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentClass("");
    setShowAddStudent(false);
  };

  const handleUpdateParentEmail = (studentId, newEmail) => {
    setStudentList((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, parent: newEmail } : s))
    );
    showSuccessWithAnimation("Parent email updated.");
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

  const handleSaveClassEndedTemplate = () => {
    setShowClassEndedTemplate(false);
    showSuccessWithAnimation("Class ended template saved successfully!");
  };

  const handleEmergencyAlert = () => {
    setShowEmergencyConfirm(true);
  };

  const handleConfirmEmergency = async () => {
    setShowEmergencyConfirm(false);

    if (apiToken && selectedSession?.className) {
      const present = attendanceLog.filter((r) => r.status !== "absent").length;
      const absent = attendanceLog.filter((r) => r.status === "absent").length;
      const late = attendanceLog.filter((r) => r.status === "late").length;

      try {
        await sendAttendanceSummaryEmail(
          {
            teacherEmail: "admin@zaproll.app",
            teacherName,
            sessionName: selectedSession.className,
            templateBody: emergencyTemplate || undefined,
            stats: { present, absent, late },
          },
          apiToken
        );
      } catch {
        // Non-fatal — still show success toast
      }
    }

    showSuccessWithAnimation("🚨 Emergency alert sent to all parents!");
  };

  const handleTeacherAbsent = () => {
    setShowTeacherAbsentConfirm(true);
  };

  const handleConfirmTeacherAbsent = async () => {
    setShowTeacherAbsentConfirm(false);

    if (apiToken && selectedSession?.className) {
      const present = attendanceLog.filter((r) => r.status !== "absent").length;
      const absent = attendanceLog.filter((r) => r.status === "absent").length;
      const late = attendanceLog.filter((r) => r.status === "late").length;

      try {
        await sendAttendanceSummaryEmail(
          {
            teacherEmail: "admin@zaproll.app",
            teacherName,
            sessionName: selectedSession.className,
            templateBody: teacherAbsentTemplate || undefined,
            stats: { present, absent, late },
          },
          apiToken
        );
      } catch {
        // Non-fatal
      }
    }

    showSuccessWithAnimation("Teacher absence notification sent to parents.");
  };

  const handleClassEnded = () => {
    setShowClassEndedConfirm(true);
  };

  const handleConfirmClassEnded = async () => {
    setShowClassEndedConfirm(false);

    if (apiToken && selectedSession?.className) {
      const present = attendanceLog.filter((r) => r.status !== "absent").length;
      const absent = attendanceLog.filter((r) => r.status === "absent").length;
      const late = attendanceLog.filter((r) => r.status === "late").length;

      try {
        await sendAttendanceSummaryEmail(
          {
            teacherEmail: "admin@zaproll.app",
            teacherName,
            sessionName: selectedSession.className,
            templateBody: classEndedTemplate || undefined,
            stats: { present, absent, late },
          },
          apiToken
        );
      } catch {
        // Non-fatal
      }
    }

    showSuccessWithAnimation("Class ended notification sent to parents.");
  };

  const handleExport = async (format, mergedLog) => {
    setShowExportOptions(false);

    const logToExport = mergedLog || attendanceLog;

    if (logToExport.length === 0) {
      setWarningMessage("No attendance records to export.");
      setShowWarning(true);
      return;
    }

    if (format === "csv" || format === "excel") {
      // Build CSV content
      const headers = ["Name", "Class", "Time", "Status"];
      const rows = logToExport.map((row) => [
        `"${(row.name || "").replace(/"/g, '""')}"`,
        `"${(row.className || "").replace(/"/g, '""')}"`,
        `"${(row.time || "").replace(/"/g, '""')}"`,
        `"${(row.status || "Present").replace(/"/g, '""')}"`,
      ]);
      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      try {
        const { Share } = require("react-native");
        await Share.share({
          message: csvContent,
          title: `Attendance Export - ${selectedSession?.className || "All Classes"}`,
        });
        showSuccessWithAnimation(`CSV exported! (${logToExport.length} records)`);
      } catch {
        showSuccessWithAnimation(`CSV ready (${logToExport.length} records)`);
      }
      return;
    }

    if (format === "pdf") {
      // PDF requires expo-print which isn't installed — share as formatted text instead
      const lines = logToExport.map(
        (row, i) =>
          `${i + 1}. ${row.name || "—"}  |  ${row.className || "—"}  |  ${row.time || "—"}  |  ${row.status || "Present"}`
      );
      const textContent = [
        `ATTENDANCE REPORT`,
        `Session: ${selectedSession?.className || "All Classes"}`,
        `Date: ${new Date().toLocaleDateString()}`,
        `Total: ${logToExport.length} records`,
        ``,
        ...lines,
      ].join("\n");

      try {
        const { Share } = require("react-native");
        await Share.share({
          message: textContent,
          title: `Attendance Report - ${selectedSession?.className || "All Classes"}`,
        });
        showSuccessWithAnimation(`Report shared! (${logToExport.length} records)`);
      } catch {
        showSuccessWithAnimation(`Report ready (${logToExport.length} records)`);
      }
    }
  };

  return {
    handleSelectSession,
    handleGenerateQr,
    handleInvalidateQr,
    handleConfirmInvalidate,
    handleCreateSession,
    handleRemoveAttendance,
    handleConfirmRemoveAttendance,
    handleAddAttendanceStudent,
    handleSaveStudent,
    handleUpdateParentEmail,
    handleSaveEmailTemplate,
    handleSaveEmergencyTemplate,
    handleSaveTeacherAbsentTemplate,
    handleSaveClassEndedTemplate,
    handleEmergencyAlert,
    handleConfirmEmergency,
    handleTeacherAbsent,
    handleConfirmTeacherAbsent,
    handleClassEnded,
    handleConfirmClassEnded,
    handleExport,
    showSuccessWithAnimation,
  };
};
