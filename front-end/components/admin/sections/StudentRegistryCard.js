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
import { GraduationCap, UserPlus, Search, X, Pencil, Check, Users, ChevronRight } from "lucide-react-native";
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
  onNavigateToSection,
  onDownloadTemplate,
  onImportStudents,
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

      {/* Header Section */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <GraduationCap size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text className="text-xl font-bold text-textPrimary font-sans">Class Registry</Text>
            <Text className="text-[11px] text-textSecondary font-sans uppercase tracking-widest">Section Management</Text>
          </View>
        </View>
        
        <View className="flex-row gap-2">
          {onImportStudents && (
            <TouchableOpacity
              onPress={onImportStudents}
              activeOpacity={0.8}
              className="h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5"
            >
              <UserPlus size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          {onOpenAddStudentModal && (
            <TouchableOpacity
              onPress={onOpenAddStudentModal}
              activeOpacity={0.8}
              className="h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20"
            >
              <Users size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modern Search Bar */}
      <View className="mb-6 flex-row items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3.5">
        <Search size={18} color={theme.colors.textSecondary} />
        <TextInput
          placeholder="Search sections or grade levels..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-base text-textPrimary font-sans"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Section Registry Grid */}
      <View className="flex-col gap-3">
        {(sectionList || [])
          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((section, index) => {
            const studentCount = (studentList || []).filter(
              std => (std.className || std.gradeLevel) === section.name
            ).length;

            return (
              <TouchableOpacity
                key={section.id || section.name}
                onPress={() => onNavigateToSection && onNavigateToSection(section)}
                activeOpacity={0.7}
                className="overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-sm"
                style={[styles.sectionCard, cardStyle(studentItemAnims[index] || studentItemAnims[0])]}
              >
                <View style={styles.sectionGlow} />
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
                      <GraduationCap size={26} color={theme.colors.primary} />
                      <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
                         <Text className="text-[10px] font-bold text-white">✓</Text>
                      </View>
                    </View>
                    <View>
                      <Text className="text-lg font-bold text-textPrimary font-sans">{section.name}</Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <View className="rounded-md bg-primary/10 px-2 py-0.5">
                          <Text className="text-[10px] font-bold uppercase text-primary font-sans">
                            {studentCount} Enrolled
                          </Text>
                        </View>
                        <Text className="text-[10px] text-textSecondary font-sans">Active Section</Text>
                      </View>
                    </View>
                  </View>
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-surface/80 border border-border">
                    <ChevronRight size={20} color={theme.colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </View>

      {(!sectionList || sectionList.length === 0) && (
        <View className="my-10 items-center py-10 rounded-3xl border border-dashed border-border">
          <GraduationCap size={48} color={theme.colors.textSecondary} />
          <Text className="mt-4 text-sm font-semibold text-textSecondary font-sans">No sections found.</Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: { borderColor: "rgba(15, 118, 110, 0.15)" },
  cardGlow: {
    position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  sectionCard: {
    position: "relative",
  },
  sectionGlow: {
    position: "absolute", left: 0, top: 0, width: 4, height: "100%", backgroundColor: theme.colors.primary, opacity: 0.3,
  },
});
