import React, { useMemo, useState, useEffect } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ClipboardList, FileText, UserPlus, X } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const AttendanceLogCard = ({
  cardStyle,
  cardAnim,
  attendanceLog,
  studentList,
  sectionList,
  selectedSession,
  logItemAnims,
  handleRemoveAttendance,
  handleAddAttendanceStudent,
  setShowExportOptions,
  setShowListSummary,
  listItemStyle,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [showAddAttendance, setShowAddAttendance] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  // Default add-panel class to the currently selected session's class
  const [addAttendanceClass, setAddAttendanceClass] = useState(
    selectedSession?.className || "all"
  );

  // Keep addAttendanceClass in sync when selectedSession changes
  useEffect(() => {
    // Find the section name that best matches the selected session's className
    const sessionClass = selectedSession?.className;
    if (sessionClass && sessionClass !== "—") {
      // Try exact match first, then partial match against section names
      const exactMatch = (sectionList || []).find((s) => s.name === sessionClass);
      const partialMatch = (sectionList || []).find((s) =>
        sessionClass.includes(s.name) || s.name.includes(sessionClass)
      );
      const matched = exactMatch || partialMatch;
      setAddAttendanceClass(matched ? matched.name : sessionClass);
    } else {
      setAddAttendanceClass("all");
    }
    setSelectedStudentId("");
  }, [selectedSession?.className, sectionList]);

  // Derive unique class names from the full log
  const classNames = useMemo(() => {
    const names = new Set((attendanceLog || []).map((r) => r.className).filter(Boolean));
    return ["all", ...Array.from(names).sort()];
  }, [attendanceLog]);

  // Filter log by selected class
  const displayedLog = useMemo(() => {
    if (selectedClass === "all") return attendanceLog;
    return attendanceLog.filter(
      (row) => row.className === selectedClass || String(row.id).startsWith("LIVE-")
    );
  }, [attendanceLog, selectedClass]);

  // Group displayed log by class name
  const groupedLog = useMemo(() => {
    const groups = {};
    displayedLog.forEach((row) => {
      const cls = row.className || "Unknown";
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(row);
    });
    return groups;
  }, [displayedLog]);

  // Deduplicate studentList by id to prevent React key collisions
  const deduplicatedStudentList = useMemo(() => {
    const seen = new Set();
    return (studentList || []).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [studentList]);

  // Use sectionList as authoritative class list (same source as Quick Select Class)
  // Fall back to student-derived names if sectionList is empty
  const studentClassNames = useMemo(() => {
    if (sectionList && sectionList.length > 0) {
      const seen = new Set();
      return (sectionList || [])
        .filter((s) => { if (seen.has(s.name)) return false; seen.add(s.name); return true; })
        .map((s) => s.name)
        .sort();
    }
    const names = new Set(
      deduplicatedStudentList.map((s) => s.className || s.gradeLevel || "Unassigned")
    );
    return Array.from(names).sort();
  }, [sectionList, deduplicatedStudentList]);

  // Students filtered by the add-panel class selector, minus those already present
  const addPanelStudents = useMemo(() => {
    const presentNames = new Set((attendanceLog || []).map((row) => row.name));
    let list = deduplicatedStudentList.filter((s) => !presentNames.has(s.name));
    if (addAttendanceClass !== "all") {
      list = list.filter(
        (s) => (s.className || s.gradeLevel || "Unassigned") === addAttendanceClass
      );
    }
    return list;
  }, [deduplicatedStudentList, attendanceLog, addAttendanceClass]);

  const onConfirmAddAttendance = () => {
    const selectedStudent = addPanelStudents.find((student) => student.id === selectedStudentId);
    handleAddAttendanceStudent(selectedStudent);
    if (selectedStudent) {
      setSelectedStudentId("");
      setShowAddAttendance(false);
    }
  };

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />

      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between" style={isCompact ? styles.compactHeaderRow : null}>
        <View className="flex-1 pr-2" style={isCompact ? styles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/10">
              <ClipboardList size={18} color={theme.colors.success} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Attendance Log</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Records captured this session, ready for export and summary.
          </Text>
        </View>
        {displayedLog.length > 0 && (
          <View className="rounded-lg bg-success/10 px-2 py-1" style={isCompact ? styles.compactCountBadge : null}>
            <Text className="text-xs font-semibold text-success font-sans">
              {displayedLog.length} checked in
            </Text>
          </View>
        )}
      </View>

      {/* Class filter pills */}
      {classNames.length > 2 && (
        <View className="mb-4 flex-row flex-wrap gap-2">
          {classNames.map((cls) => (
            <TouchableOpacity
              key={cls}
              onPress={() => setSelectedClass(cls)}
              className={`rounded-full px-3 py-1 border ${
                selectedClass === cls ? "bg-success border-success" : "bg-card border-border"
              }`}
            >
              <Text className={`text-xs font-semibold font-sans ${selectedClass === cls ? "text-white" : "text-textSecondary"}`}>
                {cls === "all" ? "All Classes" : cls}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Grouped log entries */}
      {Object.entries(groupedLog).map(([className, rows]) => (
        <View key={className} className="mb-4">
          {/* Class section header */}
          <View className="mb-2 flex-row items-center gap-2">
            <View className="h-px flex-1 bg-border" />
            <View className="rounded-full bg-success/10 px-3 py-1">
              <Text className="text-xs font-semibold text-success font-sans">{className}</Text>
            </View>
            <View className="h-px flex-1 bg-border" />
          </View>

          {rows.map((row, index) => (
            <Animated.View
              key={row.id}
              className="mb-3 rounded-2xl border border-border bg-card p-4"
              style={[
                listItemStyle,
                styles.logRow,
                logItemAnims[index] ? cardStyle(logItemAnims[index]) : null,
              ]}
            >
              {String(row.id).startsWith("LIVE-") && (
                <View className="mb-2 self-start rounded-full bg-primary/10 px-2 py-1">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-primary font-sans">Live Scan</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between" style={isCompact ? styles.compactLogRowTop : null}>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-textPrimary font-sans">{row.name}</Text>
                  {row.status && row.status !== "present" && (
                    <View className={`mt-1 self-start rounded-full px-2 py-0.5 ${
                      row.status === "late" ? "bg-warning/10" :
                      row.status === "absent" ? "bg-danger/10" :
                      "bg-success/10"
                    }`}>
                      <Text className={`text-xs font-semibold font-sans capitalize ${
                        row.status === "late" ? "text-warning" :
                        row.status === "absent" ? "text-danger" :
                        "text-success"
                      }`}>{row.status}</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center gap-2" style={isCompact ? styles.compactLogMeta : null}>
                  <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
                  {!String(row.id).startsWith("LIVE-") && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveAttendance(row.id, row.name)}
                      className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-danger/10"
                      style={styles.removeButton}
                    >
                      <X size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      ))}

      {displayedLog.length === 0 && (
        <View className="my-6 items-center">
          <Text className="text-sm text-textSecondary font-sans">No attendance records yet.</Text>
        </View>
      )}

      {/* Add to attendance */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowAddAttendance((prev) => !prev)}
        className="mt-1 rounded-2xl bg-success px-4 py-4"
        style={styles.actionButton}
      >
        <View className="flex-row items-center justify-center gap-2">
          <UserPlus size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">
            {showAddAttendance ? "Cancel" : "Add to attendance"}
          </Text>
        </View>
      </TouchableOpacity>

      {showAddAttendance && (
        <View className="mt-3 rounded-2xl border border-success/30 bg-success/10 p-4">
          {/* Class filter — always shown, defaults to current session's class */}
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Class
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => { setAddAttendanceClass("all"); setSelectedStudentId(""); }}
                className={`rounded-full border px-3 py-1 ${addAttendanceClass === "all" ? "bg-success border-success" : "bg-card border-border"}`}
              >
                <Text className={`text-xs font-semibold font-sans ${addAttendanceClass === "all" ? "text-white" : "text-textSecondary"}`}>
                  All Classes
                </Text>
              </TouchableOpacity>
              {studentClassNames.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  onPress={() => { setAddAttendanceClass(cls); setSelectedStudentId(""); }}
                  className={`rounded-full border px-3 py-1 ${addAttendanceClass === cls ? "bg-success border-success" : "bg-card border-border"}`}
                >
                  <Text className={`text-xs font-semibold font-sans ${addAttendanceClass === cls ? "text-white" : "text-textSecondary"}`}>
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Select Student
          </Text>
          {/* Scrollable student list grouped by class */}
          <View className="mb-3 rounded-2xl border border-success/20 bg-card overflow-hidden" style={{ maxHeight: 220 }}>
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
              {addPanelStudents.length > 0 ? (
                <>
                  {/* Group by class when showing all */}
                  {addAttendanceClass === "all" ? (
                    (() => {
                      const grouped = {};
                      addPanelStudents.forEach((s) => {
                        const cls = s.className || s.gradeLevel || "Unassigned";
                        if (!grouped[cls]) grouped[cls] = [];
                        grouped[cls].push(s);
                      });
                      return Object.entries(grouped).map(([cls, students]) => (
                        <View key={cls}>
                          {/* Class divider */}
                          <View className="flex-row items-center gap-2 px-4 py-2 bg-success/5">
                            <Text className="text-xs font-bold text-success font-sans uppercase tracking-wide">{cls}</Text>
                          </View>
                          {students.map((student, index) => {
                            const isSelected = selectedStudentId === student.id;
                            return (
                              <TouchableOpacity
                                key={student.id}
                                onPress={() => setSelectedStudentId(student.id)}
                                activeOpacity={0.7}
                                className={`flex-row items-center justify-between px-4 py-3 border-t border-border ${isSelected ? "bg-success/10" : "bg-card"}`}
                              >
                                <Text className={`flex-1 text-sm font-semibold font-sans ${isSelected ? "text-success" : "text-textPrimary"}`}>
                                  {student.name}
                                </Text>
                                {isSelected && (
                                  <View className="h-5 w-5 items-center justify-center rounded-full bg-success">
                                    <Text className="text-white text-xs font-bold">✓</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ));
                    })()
                  ) : (
                    addPanelStudents.map((student, index) => {
                      const isSelected = selectedStudentId === student.id;
                      return (
                        <TouchableOpacity
                          key={student.id}
                          onPress={() => setSelectedStudentId(student.id)}
                          activeOpacity={0.7}
                          className={`flex-row items-center justify-between px-4 py-3 ${index > 0 ? "border-t border-border" : ""} ${isSelected ? "bg-success/10" : "bg-card"}`}
                        >
                          <Text className={`flex-1 text-sm font-semibold font-sans ${isSelected ? "text-success" : "text-textPrimary"}`}>
                            {student.name}
                          </Text>
                          {isSelected && (
                            <View className="h-5 w-5 items-center justify-center rounded-full bg-success">
                              <Text className="text-white text-xs font-bold">✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              ) : (
                <View className="px-4 py-6 items-center">
                  <Text className="text-sm text-textSecondary font-sans text-center">
                    {addAttendanceClass !== "all"
                      ? `All students in ${addAttendanceClass} are already marked present.`
                      : "All students are already marked present."}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConfirmAddAttendance}
            disabled={!selectedStudentId || addPanelStudents.length === 0}
            className="rounded-2xl bg-success px-4 py-3"
            style={[styles.actionButton, (!selectedStudentId || addPanelStudents.length === 0) ? styles.disabledButton : null]}
          >
            <Text className="text-center text-base font-semibold text-white font-sans">
              Add selected student
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Export / Summary */}
      <View className="mt-3 flex-row gap-3" style={isCompact ? styles.stackActionRow : null}>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl bg-primary px-4 py-4"
          onPress={() => setShowExportOptions(true)}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <FileText size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">Export Data</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl border border-textPrimary bg-textPrimary px-4 py-4"
          onPress={() => setShowListSummary(true)}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <ClipboardList size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">List Summary</Text>
          </View>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { borderColor: "rgba(22, 163, 74, 0.22)" },
  compactHeaderRow: { alignItems: "stretch" },
  compactHeaderTitle: { flexBasis: "100%", paddingRight: 0 },
  compactCountBadge: { alignSelf: "flex-start", marginTop: 8 },
  compactLogRowTop: { flexDirection: "column", alignItems: "flex-start" },
  compactLogMeta: { marginTop: 8 },
  removeButton: { minHeight: 36, minWidth: 36, marginLeft: 0 },
  stackActionRow: { flexDirection: "column" },
  actionButton: { minHeight: 48, justifyContent: "center" },
  studentChip: { minHeight: 38, justifyContent: "center" },
  disabledButton: { opacity: 0.55 },
  fullWidthButton: { width: "100%" },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
  },
  logRow: { borderColor: "rgba(229, 231, 235, 0.9)" },
});
