import React, { useState, useMemo, useCallback } from "react";
import {
  Animated,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GraduationCap, UserPlus, Search, X, Pencil, Check } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const StudentRegistryCard = ({
  cardStyle,
  cardAnim,
  studentItemAnims,
  studentList,
  sectionList,
  selectedSession,
  onOpenAddStudentModal,
  listItemStyle,
  onUpdateParentEmail,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Deduplicate studentList by id to prevent React key collisions — must be before classNames
  const deduplicatedStudents = useMemo(() => {
    const seen = new Set();
    return (studentList || []).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [studentList]);

  // Use sectionList as the authoritative class list so all sections always appear
  const classNames = useMemo(() => {
    const fromSections = (sectionList || []).map((s) => s.name);
    const fromStudents = deduplicatedStudents.map((s) => s.className || s.gradeLevel || "Unassigned");
    const all = new Set([...fromSections, ...fromStudents]);
    return ["all", ...Array.from(all).sort()];
  }, [sectionList, deduplicatedStudents]);

  const filteredStudents = useMemo(() => {
    let list = deduplicatedStudents;

    // Filter by selected class
    if (selectedClass !== "all") {
      list = list.filter((s) => (s.className || s.gradeLevel || "Unassigned") === selectedClass);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      list = list.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  }, [searchQuery, deduplicatedStudents, selectedClass]);

  // Group filtered students by class
  const groupedStudents = useMemo(() => {
    const groups = {};
    filteredStudents.forEach((student) => {
      const cls = student.className || student.gradeLevel || "Unassigned";
      if (!groups[cls]) groups[cls] = [];
      groups[cls].push(student);
    });
    return groups;
  }, [filteredStudents]);

  const startEdit = useCallback((student) => {
    setEditingId(student.id);
    setEditingEmail(student.parent || "");
  }, []);

  const confirmEdit = useCallback(
    (student) => {
      if (onUpdateParentEmail) {
        onUpdateParentEmail(student.id, editingEmail.trim());
      }
      setEditingId(null);
      setEditingEmail("");
    },
    [editingEmail, onUpdateParentEmail]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingEmail("");
  }, []);

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />

      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
        <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap size={20} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Student Registry</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Keep student records updated and assign classes in one flow.
          </Text>
        </View>
        <View className="flex-col items-end gap-2">
          <View className="rounded-full bg-primary/10 px-3 py-1">
            <Text className="text-xs font-semibold text-primary font-sans">
              {filteredStudents.length}/{deduplicatedStudents.length} students
            </Text>
          </View>
          {onOpenAddStudentModal && (
            <TouchableOpacity
              onPress={onOpenAddStudentModal}
              className="flex-row items-center gap-1 rounded-lg bg-primary px-3 py-2"
            >
              <UserPlus size={14} color="white" />
              <Text className="text-xs font-semibold text-white font-sans">Add Student</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search */}
      <View className="mb-3 flex-row items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search size={16} color={theme.colors.textSecondary} />
        <TextInput
          placeholder="Search student name..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-sm text-textPrimary font-sans"
          style={{ color: theme.colors.textPrimary }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
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
                selectedClass === cls ? "bg-primary border-primary" : "bg-card border-border"
              }`}
            >
              <Text className={`text-xs font-semibold font-sans ${selectedClass === cls ? "text-white" : "text-textSecondary"}`}>
                {cls === "all" ? "All Classes" : cls}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Grouped student list */}
      {Object.entries(groupedStudents).map(([className, students]) => (
        <View key={className} className="mb-4">
          {/* Class section header */}
          <View className="mb-2 flex-row items-center gap-2">
            <View className="h-px flex-1 bg-border" />
            <View className="rounded-full bg-primary/10 px-3 py-1">
              <Text className="text-xs font-semibold text-primary font-sans">{className}</Text>
            </View>
            <View className="h-px flex-1 bg-border" />
          </View>

          {students.map((row, index) => (
            <Animated.View
              key={row.id}
              className="mb-3 rounded-2xl border border-border bg-card p-4"
              style={[listItemStyle, styles.studentRow, cardStyle(studentItemAnims[index] || studentItemAnims[0])]}
            >
              <View className="flex-row items-center justify-between" style={isCompact ? styles.compactRowTop : null}>
                <Text className="text-base font-semibold text-textPrimary font-sans flex-1">{row.name}</Text>
                <View className="ml-2 rounded-lg bg-primary/10 px-2 py-1">
                  <Text className="text-xs font-semibold text-primary font-sans">
                    {row.studentNumber || row.id}
                  </Text>
                </View>
              </View>

              {/* Editable parent email */}
              <View className="mt-2 flex-row items-center gap-2">
                {editingId === row.id ? (
                  <>
                    <TextInput
                      value={editingEmail}
                      onChangeText={setEditingEmail}
                      placeholder="Parent email..."
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 rounded-lg border border-primary bg-background px-2 py-1 text-sm text-textPrimary font-sans"
                      style={{ color: theme.colors.textPrimary }}
                    />
                    <TouchableOpacity
                      onPress={() => confirmEdit(row)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-success/10"
                    >
                      <Check size={15} color={theme.colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={cancelEdit}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-danger/10"
                    >
                      <X size={15} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text className="flex-1 text-sm text-textSecondary font-sans" numberOfLines={1} ellipsizeMode="tail">
                      {row.parent ? `📧 ${row.parent}` : "No parent email"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => startEdit(row)}
                      className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
                    >
                      <Pencil size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      ))}

      {filteredStudents.length === 0 && (
        <View className="my-6 items-center">
          <Text className="text-sm text-textSecondary font-sans">
            {searchQuery ? `No students found matching "${searchQuery}"` : "No students in this class."}
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { borderColor: "rgba(15, 118, 110, 0.2)" },
  compactHeaderRow: { alignItems: "stretch" },
  compactHeaderTitle: { flexBasis: "100%" },
  compactRowTop: { flexDirection: "column", alignItems: "flex-start" },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  studentRow: { borderColor: "rgba(229, 231, 235, 0.9)" },
});
