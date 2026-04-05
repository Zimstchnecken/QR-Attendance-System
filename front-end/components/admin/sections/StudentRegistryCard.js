import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GraduationCap, UserPlus } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";
import { studentRows, sessionRows } from "../../../data/admin";

export const StudentRegistryCard = ({
  cardStyle,
  cardAnim,
  studentItemAnims,
  selectedSession,
  showAddStudent,
  setShowAddStudent,
  newStudentName,
  setNewStudentName,
  newStudentClass,
  setNewStudentClass,
  newStudentEmail,
  setNewStudentEmail,
  handleSaveStudent,
  listItemStyle,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />
      <View
        className="mb-3 flex-row items-start justify-between gap-3"
        style={isCompact ? styles.compactHeaderRow : null}
      >
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
        <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
          <Text className="text-xs font-semibold text-primary font-sans">{studentRows.length} students</Text>
        </View>
      </View>
      {studentRows.map((row, index) => (
        <Animated.View
          key={row.id}
          className="mb-3 rounded-2xl border border-border bg-card p-4"
          style={[listItemStyle, styles.studentRow, cardStyle(studentItemAnims[index])]}
        >
          <View className="flex-row items-center justify-between" style={isCompact ? styles.compactRowTop : null}>
            <Text className="text-base font-semibold text-textPrimary font-sans flex-1">{row.name}</Text>
            <View className="ml-2 rounded-lg bg-primary/10 px-2 py-1" style={isCompact ? styles.compactTag : null}>
              <Text className="text-xs font-semibold text-primary font-sans">
                {row.className || selectedSession.className}
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">Student ID: {row.id}</Text>
          <Text className="text-sm text-textSecondary font-sans" numberOfLines={1} ellipsizeMode="tail">
            Parent Email: {row.parent}
          </Text>
        </Animated.View>
      ))}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowAddStudent(!showAddStudent)}
        className="mt-3 rounded-2xl bg-primary px-4 py-4"
        style={styles.actionButton}
      >
        <View className="flex-row items-center justify-center gap-2">
          <UserPlus size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">
            {showAddStudent ? "Cancel" : "Add student"}
          </Text>
        </View>
      </TouchableOpacity>
      {showAddStudent && (
        <View className="mt-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Student Name
          </Text>
          <TextInput
            value={newStudentName}
            onChangeText={setNewStudentName}
            placeholder="Full name"
            placeholderTextColor="#9CA3AF"
            className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
          />
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Assign to Class
          </Text>
          <View className="mb-3 flex-row gap-2 flex-wrap">
            {sessionRows.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => setNewStudentClass(cls.className)}
                className={`rounded-xl px-3 py-2 border ${
                  newStudentClass === cls.className ? "bg-primary border-primary" : "bg-card border-border"
                }`}
                style={styles.classChip}
              >
                <Text
                  className={`text-xs font-semibold ${
                    newStudentClass === cls.className ? "text-white" : "text-textSecondary"
                  } font-sans`}
                >
                  {cls.className}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Parent Email
          </Text>
          <TextInput
            value={newStudentEmail}
            onChangeText={setNewStudentEmail}
            placeholder="parent@email.com"
            placeholderTextColor="#9CA3AF"
            className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
          />
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSaveStudent}
            className="rounded-2xl bg-primary px-4 py-3"
            style={styles.actionButton}
          >
            <Text className="text-center text-base font-semibold text-white font-sans">Save Student</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactHeaderTitle: {
    flexBasis: "100%",
  },
  compactBadge: {
    alignSelf: "flex-start",
  },
  compactRowTop: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  compactTag: {
    marginLeft: 0,
    marginTop: 6,
  },
  classChip: {
    minHeight: 40,
    justifyContent: "center",
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  studentRow: {
    borderColor: "rgba(229, 231, 235, 0.9)",
  },
});

