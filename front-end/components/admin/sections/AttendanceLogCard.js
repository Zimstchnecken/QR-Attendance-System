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
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
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
    setSelectedStudentIds([]);
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

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const onConfirmAddAttendance = () => {
    const selectedStudents = deduplicatedStudentList.filter((s) => selectedStudentIds.includes(s.id));
    handleAddAttendanceStudent(selectedStudents);
    if (selectedStudents.length > 0) {
      setSelectedStudentIds([]);
      setShowAddAttendance(false);
    }
  };

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />

      {/* Header Section */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-success/10 border border-success/20">
            <ClipboardList size={22} color={theme.colors.success} />
          </View>
          <View>
            <Text className="text-xl font-bold text-textPrimary font-sans">Attendance Feed</Text>
            <Text className="text-[11px] text-textSecondary font-sans uppercase tracking-widest">Real-time Activity</Text>
          </View>
        </View>
        {displayedLog.length > 0 && (
          <View className="rounded-full bg-success/10 px-3 py-1 border border-success/20">
            <Text className="text-[11px] font-bold text-success font-sans">
              {displayedLog.length} Present
            </Text>
          </View>
        )}
      </View>

      {/* Modern Horizontal Filter */}
      {classNames.length > 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pb-2">
          <View className="flex-row gap-2">
            {classNames.map((cls) => (
              <TouchableOpacity
                key={cls}
                onPress={() => setSelectedClass(cls)}
                activeOpacity={0.7}
                className={`rounded-xl px-5 py-2.5 border ${
                  selectedClass === cls ? "bg-success border-success shadow-sm shadow-success/20" : "bg-white border-border"
                }`}
              >
                <Text className={`text-xs font-bold font-sans ${selectedClass === cls ? "text-white" : "text-textSecondary"}`}>
                  {cls === "all" ? "History" : cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Timeline Activity Feed */}
      <View className="relative">
        <View style={styles.timelineLine} />
        
        {Object.entries(groupedLog).map(([className, rows]) => (
          <View key={className} className="mb-6">
            <View className="mb-4 flex-row items-center gap-3">
              <View className="h-2 w-2 rounded-full bg-border" />
              <Text className="text-[11px] font-bold uppercase tracking-widest text-textSecondary font-sans">{className}</Text>
              <View className="h-[1px] flex-1 bg-border/40" />
            </View>

            {rows.map((row, index) => {
              const isLive = String(row.id).startsWith("LIVE-");
              return (
                <Animated.View
                  key={row.id}
                  className={`mb-4 ml-1 overflow-hidden rounded-3xl border ${isLive ? "border-primary/20 bg-primary/5" : "border-border bg-white"}`}
                  style={[
                    listItemStyle,
                    styles.logRow,
                    logItemAnims[index] ? cardStyle(logItemAnims[index]) : null,
                  ]}
                >
                  <View className="flex-row items-center p-4">
                    {/* Status Icon */}
                    <View className={`h-10 w-10 items-center justify-center rounded-xl ${isLive ? "bg-primary/10" : "bg-success/10"}`}>
                       <Text className="text-lg">{isLive ? "⚡" : "👤"}</Text>
                    </View>

                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base font-bold text-textPrimary font-sans">{row.name}</Text>
                        <Text className="text-[10px] font-bold text-textSecondary font-sans">{row.time}</Text>
                      </View>
                      
                      <View className="mt-1 flex-row items-center gap-2">
                         <View className="h-1.5 w-1.5 rounded-full bg-success" />
                         <Text className="text-[11px] text-textSecondary font-sans">Authenticated Entry</Text>
                         {row.status && row.status !== "present" && (
                            <View className={`rounded-md px-1.5 py-0.5 ${
                              row.status === "late" ? "bg-warning/10" : "bg-danger/10"
                            }`}>
                              <Text className={`text-[9px] font-bold uppercase font-sans ${
                                row.status === "late" ? "text-warning" : "text-danger"
                              }`}>{row.status}</Text>
                            </View>
                         )}
                      </View>
                    </View>

                    {!isLive && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveAttendance(row.id, row.name)}
                        className="ml-3 h-10 w-10 items-center justify-center rounded-xl bg-danger/5 border border-danger/10"
                      >
                        <X size={16} color={theme.colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </View>

      {displayedLog.length === 0 && (
        <View className="my-6 items-center py-12 rounded-3xl border border-dashed border-border/50">
          <ClipboardList size={42} color={theme.colors.textSecondary} />
          <Text className="mt-4 text-sm font-semibold text-textSecondary font-sans">No activity recorded yet.</Text>
        </View>
      )}

      {/* Modern Action Bar */}
      <View className="mt-2">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowAddAttendance((prev) => !prev)}
          className={`mb-4 flex-row items-center justify-center gap-3 rounded-2xl py-4 shadow-sm ${showAddAttendance ? "bg-white border border-border" : "bg-success shadow-success/20"}`}
        >
          {showAddAttendance ? <X size={20} color={theme.colors.textPrimary} /> : <UserPlus size={20} color="#FFFFFF" />}
          <Text className={`text-base font-bold font-sans ${showAddAttendance ? "text-textPrimary" : "text-white"}`}>
            {showAddAttendance ? "Close Panel" : "Manual Attendance"}
          </Text>
        </TouchableOpacity>

        {showAddAttendance && (
          <View className="mb-4 rounded-3xl border border-success/10 bg-success/5 p-5">
            <View className="mb-4 flex-row items-center justify-between">
               <Text className="text-xs font-bold uppercase tracking-wider text-textSecondary font-sans">Select Class</Text>
               <TouchableOpacity onPress={() => setAddAttendanceClass("all")}>
                  <Text className="text-[10px] font-bold text-success uppercase">Reset</Text>
               </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => { setAddAttendanceClass("all"); }}
                  className={`rounded-xl px-4 py-2 border ${addAttendanceClass === "all" ? "bg-success border-success" : "bg-white border-border"}`}
                >
                  <Text className={`text-xs font-bold font-sans ${addAttendanceClass === "all" ? "text-white" : "text-textSecondary"}`}>All</Text>
                </TouchableOpacity>
                {studentClassNames.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => { setAddAttendanceClass(cls); }}
                    className={`rounded-xl px-4 py-2 border ${addAttendanceClass === cls ? "bg-success border-success" : "bg-white border-border"}`}
                  >
                    <Text className={`text-xs font-bold font-sans ${addAttendanceClass === cls ? "text-white" : "text-textSecondary"}`}>{cls}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View className="mb-5 max-h-[220px] rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                {addPanelStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const studentInitials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                  return (
                    <TouchableOpacity
                      key={student.id}
                      onPress={() => toggleStudentSelection(student.id)}
                      className={`flex-row items-center px-4 py-3.5 border-b border-border/20 ${isSelected ? "bg-success/5" : ""}`}
                    >
                      <View className={`h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border mr-4 ${isSelected ? "border-success bg-success/5" : ""}`}>
                         <Text className={`text-xs font-bold ${isSelected ? "text-success" : "text-textSecondary"}`}>{studentInitials}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`text-sm font-bold font-sans ${isSelected ? "text-success" : "text-textPrimary"}`}>{student.name}</Text>
                        <Text className="text-[10px] text-textSecondary uppercase tracking-tighter">{student.className || student.gradeLevel}</Text>
                      </View>
                      <View className={`h-6 w-6 rounded-lg border items-center justify-center ${isSelected ? "bg-success border-success" : "border-border"}`}>
                        {isSelected && <Text className="text-white text-[10px] font-bold">✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={onConfirmAddAttendance}
              disabled={selectedStudentIds.length === 0}
              className={`rounded-2xl py-4 items-center shadow-sm ${selectedStudentIds.length > 0 ? "bg-success shadow-success/20" : "bg-success/30"}`}
            >
              <Text className="text-base font-bold text-white font-sans">
                Enroll {selectedStudentIds.length} Student(s)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowExportOptions(true)}
            className="flex-1 flex-row items-center justify-center gap-3 rounded-2xl bg-primary py-4 shadow-lg shadow-primary/20"
          >
            <FileText size={20} color="#FFFFFF" />
            <Text className="text-base font-bold text-white font-sans">Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowListSummary(true)}
            className="flex-1 flex-row items-center justify-center gap-3 rounded-2xl bg-textPrimary py-4 shadow-lg shadow-black/10"
          >
            <ClipboardList size={20} color="#FFFFFF" />
            <Text className="text-base font-bold text-white font-sans">Summary</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { borderColor: "rgba(22, 163, 74, 0.15)" },
  logRow: { position: "relative" },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(22, 163, 74, 0.08)",
  },
  timelineLine: {
    position: "absolute",
    left: 1,
    top: 10,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 1,
  },
});
