import React from "react";
import { Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GraduationCap } from "lucide-react-native";
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
}) => (
  <GlassCard className="mb-6" style={cardStyle(cardAnim)}>
    <View className="mb-3 flex-row items-center gap-2">
      <GraduationCap size={20} color={theme.colors.primary} />
      <Text className="text-lg font-semibold text-textPrimary font-sans">Student Registry</Text>
    </View>
    {studentRows.map((row, index) => (
      <Animated.View
        key={row.id}
        className="mb-3 rounded-2xl border border-border bg-card p-4"
        style={[listItemStyle, cardStyle(studentItemAnims[index])]}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-textPrimary font-sans flex-1">{row.name}</Text>
          <View className="ml-2 rounded-lg bg-primary/10 px-2 py-1">
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
    >
      <View className="flex-row items-center justify-center gap-2">
        <GraduationCap size={18} color="#FFFFFF" />
        <Text className="text-center text-base font-semibold text-white font-sans">
          {showAddStudent ? "Cancel" : "Add student"}
        </Text>
      </View>
    </TouchableOpacity>
    {showAddStudent && (
      <View className="mt-3 rounded-2xl border border-border bg-card p-4">
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
        >
          <Text className="text-center text-base font-semibold text-white font-sans">Save Student</Text>
        </TouchableOpacity>
      </View>
    )}
  </GlassCard>
);
