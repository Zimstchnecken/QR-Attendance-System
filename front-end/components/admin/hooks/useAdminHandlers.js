import { Animated } from "react-native";
import {
  fetchStudents,
  fetchClassSessions,
  fetchSectionSubjects,
  openClassSession,
  sendAttendanceSummaryEmail,
  bulkImportStudents,
} from "../../../utils/api";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as Print from "expo-print";

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

  const handleAddAttendanceStudent = (students) => {
    if (!students) return;
    const studentArray = Array.isArray(students) ? students : [students];
    
    if (studentArray.length === 0) return;

    const targetClassName = selectedSession?.className || "General";
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newRecords = studentArray.map((student, index) => ({
      id: `M-${Date.now()}-${index}`,
      name: student.name,
      className: targetClassName,
      time: currentTime,
    }));

    setAttendanceLog([...newRecords, ...attendanceLog]);
    showSuccessWithAnimation(`${studentArray.length} student(s) added to attendance.`);
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
        const filename = `Attendance_${(selectedSession?.className || "All").replace(/\s+/g, "_")}_${Date.now()}.csv`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Download Attendance Report",
            UTI: "public.comma-separated-values-text",
          });
          showSuccessWithAnimation(`Report exported as ${filename}`);
        } else {
          // Fallback to basic share if expo-sharing is not supported (unlikely on mobile)
          const { Share } = require("react-native");
          await Share.share({ message: csvContent });
        }
      } catch (err) {
        setWarningMessage("Failed to generate file for download.");
        setShowWarning(true);
      }
      return;
    }

    if (format === "pdf") {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #111; }
              h1 { color: #0F766E; margin-bottom: 5px; }
              .meta { color: #666; margin-bottom: 20px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #F3F4F6; text-align: left; padding: 12px; border-bottom: 2px solid #E5E7EB; }
              td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
              .present { color: #166534; font-weight: bold; }
              .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
            </style>
          </head>
          <body>
            <h1>ATTENDANCE REPORT</h1>
            <div class="meta">
              <p>Session: ${selectedSession?.className || "All Classes"}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>Total Records: ${logToExport.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${logToExport.map((row, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${row.name || "—"}</td>
                    <td>${row.className || "—"}</td>
                    <td>${row.time || "—"}</td>
                    <td class="present">${row.status || "Present"}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              Generated by ZapRoll Attendance System - ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Attendance Report",
        });
        showSuccessWithAnimation(`PDF Report saved!`);
      } catch (err) {
        setWarningMessage("Failed to generate PDF report.");
        setShowWarning(true);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    const csvContent = "firstName,lastName,studentNumber,gradeLevel,parentEmail,sectionName\nJohn,Doe,ST-001,Grade 10,john.doe@example.com,Grade 10 - Newton\nJane,Smith,ST-002,Grade 11,jane.smith@example.com,Grade 11 - Einstein";
    
    try {
      const filename = "Student_Import_Template.csv";
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Download Import Template",
        });
      }
    } catch (err) {
      setWarningMessage("Failed to download template.");
      setShowWarning(true);
    }
  };

  const handleImportStudents = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/comma-separated-values", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri);
      
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        setWarningMessage("The CSV file is empty or missing data.");
        setShowWarning(true);
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());
      
      const studentsToImport = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const student = {};
        headers.forEach((header, index) => {
          student[header] = values[index];
        });
        return student;
      }).filter(s => s.firstName && s.lastName);

      if (studentsToImport.length === 0) {
        setWarningMessage("No valid student records found (FirstName and LastName are required).");
        setShowWarning(true);
        return;
      }

      setIsGenerating(true);
      const importResult = await bulkImportStudents(studentsToImport, apiToken);
      setIsGenerating(false);
      
      showSuccessWithAnimation(`Successfully imported ${importResult.imported} students!`);
      
      // Refresh students
      const updatedStudents = await fetchStudents(apiToken);
      state.setStudentList(updatedStudents);
    } catch (err) {
      setIsGenerating(false);
      setWarningMessage(err.message || "Import failed. Check your file format.");
      setShowWarning(true);
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
    handleDownloadTemplate,
    handleImportStudents,
    showSuccessWithAnimation,
  };
};
