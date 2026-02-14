import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  Ban,
  FileDown,
  LogOut,
  Mail,
  MailCheck,
  Plus,
  QrCode,
  Send,
  ShieldAlert,
  UserX,
  Users,
} from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { logRows, sessionRows, studentRows } from "../data/admin";

export default function AdminScreen({ onLogout }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <ScrollView className="px-6 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-6 flex-row flex-wrap items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-bold text-textPrimary font-sans">Teacher Dashboard</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Manage sessions, students, and attendance export</Text>
          </View>
          <TouchableOpacity onPress={onLogout} activeOpacity={0.8} className="self-start rounded-2xl bg-danger px-4 py-3">
            <View className="flex-row items-center gap-2">
              <LogOut size={16} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white font-sans">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-6 flex-row gap-3">
          <GlassCard className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <QrCode size={16} color="#4F6BED" />
              </View>
              <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Active Sessions</Text>
            </View>
            <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">02</Text>
            <Text className="text-xs text-textSecondary font-sans">Live QR codes right now</Text>
          </GlassCard>
          <GlassCard className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <MailCheck size={16} color="#4F6BED" />
              </View>
              <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Emails Sent</Text>
            </View>
            <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">97</Text>
            <Text className="text-xs text-textSecondary font-sans">Parents notified today</Text>
          </GlassCard>
        </View>

        <GlassCard className="mb-6">
          <View className="mb-3 flex-row items-center gap-2">
            <QrCode size={18} color="#4F6BED" />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Active QR Session</Text>
          </View>
          <View className="mb-4 rounded-2xl border border-border bg-card p-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Grade 12 - STEM A</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Session ID: QR-1202</Text>
            <View className="mt-4 h-40 items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-surface">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <QrCode size={26} color="#4F6BED" />
              </View>
              <Text className="mt-3 text-sm font-semibold text-textPrimary font-sans">QR Code Preview</Text>
              <Text className="mt-2 text-xs text-textSecondary font-sans">Generated QR will appear here</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-primary px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <QrCode size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Generate New QR</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-danger px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <Ban size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Invalidate</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Today Sessions</Text>
          {sessionRows.map((row) => (
            <View key={row.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
              <Text className="text-sm font-semibold text-textPrimary font-sans">{row.className}</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">Present: {row.present}/{row.total}</Text>
              <Text
                className={`mt-2 text-xs font-semibold font-sans ${row.status === "Active" ? "text-success" : "text-textSecondary"}`}
              >
                {row.status}
              </Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard className="mb-6">
          <View className="mb-3 flex-row items-center gap-2">
            <Users size={18} color="#4F6BED" />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Student Registry</Text>
          </View>
          {studentRows.map((row) => (
            <View key={row.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
              <Text className="text-sm font-semibold text-textPrimary font-sans">{row.name}</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">Student ID: {row.id}</Text>
              <Text className="text-sm text-textSecondary font-sans">Parent Email: {row.parent}</Text>
            </View>
          ))}
          <TouchableOpacity activeOpacity={0.85} className="mt-3 rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <Plus size={16} color="#FFFFFF" />
              <Text className="text-center font-semibold text-white font-sans">Add Student / Parent Email</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Attendance Log (Local)</Text>
          {logRows.map((row) => (
            <View key={row.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
              <Text className="text-sm font-semibold text-textPrimary font-sans">{row.name}</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">{row.className}</Text>
              <Text className="text-sm text-textSecondary font-sans">{row.time}</Text>
            </View>
          ))}
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-primary px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <FileDown size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Export CSV</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-primary px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <Send size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Email Summary</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard>
          <View className="mb-3 flex-row items-center gap-2">
            <Mail size={18} color="#4F6BED" />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Email Automation</Text>
          </View>
          <Text className="text-sm text-textSecondary font-sans">
            Resend.com API integration for parental notifications.
          </Text>
          <TouchableOpacity activeOpacity={0.85} className="mt-4 rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <Mail size={16} color="#FFFFFF" />
              <Text className="text-center font-semibold text-white font-sans">Test Email Template</Text>
            </View>
          </TouchableOpacity>
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-danger px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <ShieldAlert size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Emergency Alert</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} className="flex-1 rounded-2xl bg-primary px-4 py-4">
              <View className="flex-row items-center justify-center gap-2">
                <UserX size={16} color="#FFFFFF" />
                <Text className="text-center font-semibold text-white font-sans">Teacher Absent</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
