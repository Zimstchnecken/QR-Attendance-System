import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera, CircleCheck, Lightbulb, LogOut, QrCode } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { latestStatus, scanTips } from "../data/student";
import { theme } from "../constants/theme";

export default function StudentScreen({ onLogout }) {
  const screenAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(Array.from({ length: 3 }, () => new Animated.Value(0))).current;
  const successAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      50,
      cardAnims.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, screenAnim]);

  const handleScan = () => {
    successAnim.setValue(0);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const screenStyle = useMemo(
    () => ({
      opacity: screenAnim,
      transform: [
        {
          translateY: screenAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          }),
        },
      ],
    }),
    [screenAnim]
  );

  const cardStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <Animated.ScrollView
        className="px-6 py-6"
        style={screenStyle}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="mb-6 flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-bold text-textPrimary font-sans">Student Check-In</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Scan the active class QR code</Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.9}
            className="self-start rounded-2xl border border-border bg-card px-4 py-4"
          >
            <View className="flex-row items-center gap-2">
              <LogOut size={18} color={theme.colors.textSecondary} />
              <Text className="text-xs font-semibold text-textSecondary font-sans">Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <GlassCard className="mb-6 items-center" style={cardStyle(cardAnims[0])}>
          <View className="mb-3 flex-row items-center gap-2">
            <Camera size={18} color={theme.colors.primary} />
            <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">QR Scanner</Text>
          </View>
          <View className="w-full items-center justify-center rounded-2xl bg-surface" style={styles.scannerFrame}>
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <QrCode size={24} color={theme.colors.primary} />
            </View>
            <Text className="mt-4 text-center text-base font-semibold text-textPrimary font-sans">Scan QR Code</Text>
            <Text className="mt-2 text-center text-sm text-textSecondary font-sans">Hold steady to capture</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleScan}
            className="mt-4 w-full rounded-2xl bg-primary px-4 py-4"
          >
            <View className="flex-row items-center justify-center gap-2">
              <CircleCheck size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">Scan QR Code</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard className="mb-4" style={cardStyle(cardAnims[1])}>
          <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Latest Status</Text>
          <Text className="text-sm text-textSecondary font-sans">Class: {latestStatus.className}</Text>
          <Text className="text-sm text-textSecondary font-sans">Time: {latestStatus.time}</Text>
          <Animated.View
            className="mt-3 flex-row items-center gap-2"
            style={{
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <CircleCheck size={18} color={theme.colors.success} />
            <Text className="text-sm font-semibold text-success font-sans">{latestStatus.message}</Text>
          </Animated.View>
        </GlassCard>

        <GlassCard style={cardStyle(cardAnims[2])}>
          <View className="mb-4 flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb size={18} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Scan Tips</Text>
          </View>
          <View className="rounded-2xl bg-primary/5 p-4">
            {scanTips.map((tip, index) => (
              <View key={`${index}-${tip.slice(0, 12)}`} className="mb-3 flex-row gap-3">
                <Text className="text-sm font-semibold text-primary font-sans">{index + 1}.</Text>
                <Text className="flex-1 text-sm font-medium text-textPrimary font-sans">{tip}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  scannerFrame: {
    height: 224,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
  },
});
