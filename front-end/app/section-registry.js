import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, GraduationCap, Search, UserPlus, X, Pencil, Check, Users } from "lucide-react-native";
import { ScreenBackground, GlassCard } from "../components";
import { theme } from "../constants/theme";

export default function SectionRegistryScreen({
  section,
  studentList,
  onBack,
  onOpenAddStudentModal,
  onUpdateParentEmail,
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState("");

  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [screenAnim]);

  const filteredStudents = useMemo(() => {
    // Exact match for the section name
    let list = (studentList || []).filter(
      (s) => (s.className || s.gradeLevel || "Unassigned") === section.name
    );

    if (searchQuery.trim()) {
      list = list.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  }, [searchQuery, studentList, section.name]);

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditingEmail(student.parent || "");
  };

  const confirmEdit = (student) => {
    if (onUpdateParentEmail) {
      onUpdateParentEmail(student.id, editingEmail.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingEmail("");
  };

  const animatedStyle = {
    opacity: screenAnim,
    transform: [
      {
        translateX: screenAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      
      <View style={styles.header} className="px-4 py-4 flex-row items-center">
        <TouchableOpacity 
          onPress={onBack} 
          className="h-10 w-10 items-center justify-center rounded-xl bg-card border border-border"
        >
          <ChevronLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-textPrimary font-sans">{section.name}</Text>
          <Text className="text-sm text-textSecondary font-sans">Section Roster</Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-xs font-semibold text-primary font-sans">{filteredStudents.length} Students</Text>
        </View>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, animatedStyle]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard className="mb-6 mx-4 overflow-hidden" style={styles.card}>
          <View style={styles.cardGlow} />
          
          {/* Summary Stats Overlay */}
          <View className="mb-6 flex-row gap-3">
             <View className="flex-1 rounded-2xl bg-primary/5 border border-primary/10 p-3">
                <Text className="text-[10px] font-bold uppercase text-primary/60 font-sans">Enrolled</Text>
                <Text className="text-xl font-bold text-primary font-sans">{filteredStudents.length}</Text>
             </View>
             <View className="flex-1 rounded-2xl bg-success/5 border border-success/10 p-3">
                <Text className="text-[10px] font-bold uppercase text-success/60 font-sans">Active</Text>
                <Text className="text-xl font-bold text-success font-sans">100%</Text>
             </View>
          </View>

          {/* Search bar */}
          <View className="mb-6 flex-row items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 py-3.5">
            <Search size={18} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Filter students by name..."
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

          {/* Action Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold text-textSecondary uppercase tracking-widest">Student Directory</Text>
              <View className="mt-1 h-0.5 w-8 bg-primary/30 rounded-full" />
            </View>
            {onOpenAddStudentModal && (
              <TouchableOpacity
                onPress={onOpenAddStudentModal}
                activeOpacity={0.8}
                className="flex-row items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 shadow-sm shadow-primary/20"
              >
                <UserPlus size={14} color="white" />
                <Text className="text-xs font-bold text-white font-sans">Enroll New</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Student List Grid */}
          <View className="flex-col gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <View 
                    key={student.id} 
                    className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
                  >
                    <View className="flex-row items-center p-4">
                      {/* Avatar Circle */}
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
                        <Text className="text-base font-bold text-primary">{initials}</Text>
                      </View>
                      
                      <View className="ml-4 flex-1">
                        <Text className="text-base font-bold text-textPrimary font-sans">{student.name}</Text>
                        <Text className="text-[11px] text-textSecondary font-sans uppercase tracking-tighter">
                          ID: {student.studentNumber || student.id}
                        </Text>
                      </View>

                      <View className="h-2 w-2 rounded-full bg-success" />
                    </View>

                    {/* Contact Info Action Bar */}
                    <View className="bg-surface/50 px-4 py-3 border-t border-border/50">
                      {editingId === student.id ? (
                        <View className="flex-row items-center gap-2">
                          <TextInput
                            value={editingEmail}
                            onChangeText={setEditingEmail}
                            placeholder="Enter parent email..."
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="email-address"
                            className="flex-1 rounded-xl border border-primary bg-white px-3 py-2 text-sm text-textPrimary font-sans"
                            autoFocus
                          />
                          <TouchableOpacity
                            onPress={() => confirmEdit(student)}
                            className="h-10 w-10 items-center justify-center rounded-xl bg-success"
                          >
                            <Check size={18} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={cancelEdit}
                            className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10 border border-danger/20"
                          >
                            <X size={18} color={theme.colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                             <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                                <Users size={12} color={theme.colors.primary} />
                             </View>
                             <Text className="text-xs text-textSecondary font-sans italic">
                                {student.parent || "No email assigned"}
                             </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => startEdit(student)}
                            className="rounded-lg bg-white px-3 py-1.5 border border-border flex-row items-center gap-1.5"
                          >
                            <Pencil size={12} color={theme.colors.textSecondary} />
                            <Text className="text-[10px] font-bold text-textSecondary uppercase">Edit</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-16 items-center justify-center">
                <View className="h-20 w-20 items-center justify-center rounded-full bg-surface mb-4 border border-dashed border-border">
                  <Users size={32} color={theme.colors.textSecondary} />
                </View>
                <Text className="text-sm font-semibold text-textSecondary font-sans text-center px-10">
                  {searchQuery ? "No matching students found." : "This section is currently empty."}
                </Text>
              </View>
            )}
          </View>
        </GlassCard>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  header: { paddingTop: 16 },
  scrollContent: { paddingBottom: 40 },
  card: { borderColor: "rgba(15, 118, 110, 0.2)" },
  cardGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(15, 118, 110, 0.05)",
  },
});
