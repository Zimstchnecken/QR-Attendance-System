import { useRef, useState } from "react";
import { Animated } from "react-native";
import { logRows, sessionRows, studentRows } from "../../../data/admin";

export const useAdminState = () => {
  // QR Session state
  const [isGenerating, setIsGenerating] = useState(false);
  const [allowRename, setAllowRename] = useState(false);
  const [selectedSession, setSelectedSession] = useState(sessionRows[0]);
  const [sessionName, setSessionName] = useState(selectedSession.className);
  
  // Student state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  
  // Session state
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  
  // Attendance state
  const [attendanceLog, setAttendanceLog] = useState(logRows);
  const [studentToRemove, setStudentToRemove] = useState(null);
  
  // Modal states
  const [showInvalidateConfirm, setShowInvalidateConfirm] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [showTeacherAbsentConfirm, setShowTeacherAbsentConfirm] = useState(false);
  const [showClassEndedConfirm, setShowClassEndedConfirm] = useState(false);
  const [showRemoveAttendanceConfirm, setShowRemoveAttendanceConfirm] = useState(false);
  const [showListSummary, setShowListSummary] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);
  const [showEmergencyTemplate, setShowEmergencyTemplate] = useState(false);
  const [showTeacherAbsentTemplate, setShowTeacherAbsentTemplate] = useState(false);
  const [showClassEndedTemplate, setShowClassEndedTemplate] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  // Message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [lastScannedStudent, setLastScannedStudent] = useState(null);
  
  // Template states
  const [emailTemplate, setEmailTemplate] = useState(
    "Dear Parent,\n\nYour child {student} has checked in for {class} at {time}.\n\nBest regards,\nSchool Administration"
  );
  const [emergencyTemplate, setEmergencyTemplate] = useState(
    "EMERGENCY ALERT\n\nThis is an urgent notification regarding {student} in {class}.\n\nPlease contact the school immediately.\n\nSchool Administration"
  );
  const [teacherAbsentTemplate, setTeacherAbsentTemplate] = useState(
    "Teacher Absent Notification\n\nDear Parent,\n\nThe teacher for {class} is absent today. Class arrangements have been made.\n\nSchool Administration"
  );
  const [classEndedTemplate, setClassEndedTemplate] = useState(
    "Class Ended Notification\n\nDear Parent,\n\nYour child's class {class} has already ended. Thank you.\n\nSchool Administration"
  );
  
  // Animation refs
  const successAnim = useRef(new Animated.Value(0)).current;
  const screenAnim = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  const sessionItemAnims = useRef(sessionRows.map(() => new Animated.Value(0))).current;
  const studentItemAnims = useRef(studentRows.map(() => new Animated.Value(0))).current;
  const logItemAnims = useRef(logRows.map(() => new Animated.Value(0))).current;

  return {
    // QR Session
    isGenerating,
    setIsGenerating,
    allowRename,
    setAllowRename,
    selectedSession,
    setSelectedSession,
    sessionName,
    setSessionName,
    
    // Students
    showAddStudent,
    setShowAddStudent,
    newStudentName,
    setNewStudentName,
    newStudentEmail,
    setNewStudentEmail,
    newStudentClass,
    setNewStudentClass,
    
    // Sessions
    showNewSessionForm,
    setShowNewSessionForm,
    newSessionName,
    setNewSessionName,
    
    // Attendance
    attendanceLog,
    setAttendanceLog,
    studentToRemove,
    setStudentToRemove,
    
    // Modals
    showInvalidateConfirm,
    setShowInvalidateConfirm,
    showEmergencyConfirm,
    setShowEmergencyConfirm,
    showTeacherAbsentConfirm,
    setShowTeacherAbsentConfirm,
    showClassEndedConfirm,
    setShowClassEndedConfirm,
    showRemoveAttendanceConfirm,
    setShowRemoveAttendanceConfirm,
    showListSummary,
    setShowListSummary,
    showTemplateSelection,
    setShowTemplateSelection,
    showEmailTemplate,
    setShowEmailTemplate,
    showEmergencyTemplate,
    setShowEmergencyTemplate,
    showTeacherAbsentTemplate,
    setShowTeacherAbsentTemplate,
    showClassEndedTemplate,
    setShowClassEndedTemplate,
    showExportOptions,
    setShowExportOptions,
    showWarning,
    setShowWarning,
    warningMessage,
    setWarningMessage,
    
    // Messages
    showSuccessMessage,
    setShowSuccessMessage,
    successMessage,
    setSuccessMessage,
    lastScannedStudent,
    setLastScannedStudent,
    
    // Templates
    emailTemplate,
    setEmailTemplate,
    emergencyTemplate,
    setEmergencyTemplate,
    teacherAbsentTemplate,
    setTeacherAbsentTemplate,
    classEndedTemplate,
    setClassEndedTemplate,
    
    // Animations
    successAnim,
    screenAnim,
    qrAnim,
    cardAnims,
    sessionItemAnims,
    studentItemAnims,
    logItemAnims,
  };
};
