import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { fetchClassSessions, fetchStudents, fetchSections } from "../../../utils/api";

const MAX_ANIM_SLOTS = 20; // pre-allocate enough slots for dynamic additions

// Placeholder session used before data loads so selectedSession is never null.
const EMPTY_SESSION = {
  id: "",
  className: "—",
  present: 0,
  total: 0,
  status: "Inactive",
  isLastPeriod: false,
};

export const useAdminState = (apiToken) => {
  // ── Loading / error ────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ── QR Session state ───────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [allowRename, setAllowRename] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(EMPTY_SESSION);
  const [sessionName, setSessionName] = useState(EMPTY_SESSION.className);

  // ── Student state ──────────────────────────────────────────────────────────
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");
  const [studentList, setStudentList] = useState([]);

  // ── Sections list ──────────────────────────────────────────────────────────
  const [sectionList, setSectionList] = useState([]);

  // ── Session form state ─────────────────────────────────────────────────────
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  // ── Attendance state ───────────────────────────────────────────────────────
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [studentToRemove, setStudentToRemove] = useState(null);

  // ── Modal states ───────────────────────────────────────────────────────────
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

  // ── Message states ─────────────────────────────────────────────────────────
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [lastScannedStudent, setLastScannedStudent] = useState(null);

  // ── Template states ────────────────────────────────────────────────────────
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

  // ── Animation refs ─────────────────────────────────────────────────────────
  const successAnim = useRef(new Animated.Value(0)).current;
  const screenAnim = useRef(new Animated.Value(0)).current;
  const qrAnim = useRef(new Animated.Value(1)).current;
  const cardAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;
  const sessionItemAnims = useRef(Array.from({ length: MAX_ANIM_SLOTS }, () => new Animated.Value(0))).current;
  const studentItemAnims = useRef(Array.from({ length: MAX_ANIM_SLOTS }, () => new Animated.Value(0))).current;
  const logItemAnims = useRef(Array.from({ length: MAX_ANIM_SLOTS }, () => new Animated.Value(0))).current;

  // ── Data fetching ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [fetchedSessions, fetchedStudents, fetchedSections] = await Promise.all([
        fetchClassSessions(apiToken),
        fetchStudents(apiToken),
        fetchSections(apiToken),
      ]);

      setSessions(fetchedSessions);
      setStudentList(fetchedStudents);
      setSectionList(fetchedSections);

      // Select the first session as default (if any)
      if (fetchedSessions.length > 0) {
        setSelectedSession(fetchedSessions[0]);
        setSessionName(fetchedSessions[0].className);
      }

      // Attendance starts empty — loaded on demand per session
      setAttendanceLog([]);
    } catch (err) {
      setLoadError(err?.message ?? "Failed to load dashboard data.");
      // Keep empty arrays as fallback — app remains usable
      setSessions([]);
      setStudentList([]);
      setSectionList([]);
      setAttendanceLog([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Loading / error
    isLoading,
    loadError,
    reload: loadData,

    // QR Session
    isGenerating,
    setIsGenerating,
    allowRename,
    setAllowRename,
    selectedSession,
    setSelectedSession,
    sessionName,
    setSessionName,
    sessions,
    setSessions,

    // Students
    showAddStudent,
    setShowAddStudent,
    newStudentName,
    setNewStudentName,
    newStudentEmail,
    setNewStudentEmail,
    newStudentClass,
    setNewStudentClass,
    studentList,
    setStudentList,
    sectionList,
    setSectionList,

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
