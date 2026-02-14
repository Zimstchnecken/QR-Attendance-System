import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Camera, CheckCircle2, Lightbulb, LogOut, QrCode } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { latestStatus, scanTips } from "../data/student";

export default function StudentScreen({ onLogout }) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <ScrollView className="px-6 py-6">
        <View className="mb-6 flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-bold text-textPrimary font-sans">Student Check-In</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Scan the active class QR code</Text>
          </View>
          <TouchableOpacity onPress={onLogout} activeOpacity={0.8} className="self-start rounded-2xl bg-danger px-4 py-4">
            <View className="flex-row items-center gap-2">
              <LogOut size={16} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white font-sans">Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        <GlassCard className="mb-6 items-center">
          <View className="mb-3 flex-row items-center gap-2">
            <Camera size={16} color="#4F6BED" />
            <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">QR Scanner</Text>
          </View>
          <View className="h-64 w-full items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-surface">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <QrCode size={28} color="#4F6BED" />
            </View>
            <Text className="mt-4 text-center text-base font-semibold text-textPrimary font-sans">Camera Preview</Text>
            <Text className="mt-2 text-center text-sm text-textSecondary font-sans">Ready for scanning</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} className="mt-4 w-full rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text className="text-center font-semibold text-white font-sans">Simulate Successful Scan</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Latest Status</Text>
          <Text className="text-sm text-textSecondary font-sans">Class: {latestStatus.className}</Text>
          <Text className="text-sm text-textSecondary font-sans">Time: {latestStatus.time}</Text>
          <View className="mt-3 flex-row items-center gap-2">
            <CheckCircle2 size={16} color="#16A34A" />
            <Text className="text-sm font-semibold text-success font-sans">{latestStatus.message}</Text>
          </View>
        </GlassCard>

        <GlassCard>
          <View className="mb-2 flex-row items-center gap-2">
            <Lightbulb size={16} color="#6B7280" />
            <Text className="text-lg font-semibold text-textPrimary font-sans">Scan Tips</Text>
          </View>
          {scanTips.map((tip, index) => (
            <Text
              key={`${index}-${tip.slice(0, 12)}`}
              className={`text-sm text-textSecondary font-sans ${index > 0 ? "mt-2" : ""}`}
            >
              {tip}
            </Text>
          ))}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
