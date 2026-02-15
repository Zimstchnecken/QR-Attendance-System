import React from "react";
import { Text, View } from "react-native";
import { CheckCircle, QrCode } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const SummaryCards = ({ cardStyle, cardAnims }) => (
  <View className="mb-6 flex-row gap-3">
    <GlassCard className="flex-1" style={cardStyle(cardAnims[0])}>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <QrCode size={18} color={theme.colors.primary} />
        </View>
        <Text
          className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Active sessions
        </Text>
      </View>
      <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">02</Text>
      <Text className="text-sm text-textSecondary font-sans">Live QR sessions</Text>
    </GlassCard>
    <GlassCard className="flex-1" style={cardStyle(cardAnims[1])}>
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <CheckCircle size={18} color={theme.colors.primary} />
        </View>
        <Text
          className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Notified
        </Text>
      </View>
      <Text className="mt-3 text-3xl font-bold text-textPrimary font-sans">97</Text>
      <Text className="text-sm text-textSecondary font-sans">Parents notified</Text>
    </GlassCard>
  </View>
);
