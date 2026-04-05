import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, CircleCheck, Clock3, House, LogOut, QrCode, ShieldAlert } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { DashboardTabBar } from "../components/admin/sections";
import { attendanceHistory, latestStatus, scannerReminders } from "../data/student";
import { theme } from "../constants/theme";

const STUDENT_TABS = [
  { key: "home", label: "Home", icon: House },
  { key: "scan", label: "Scanner", icon: QrCode },
  { key: "history", label: "History", icon: Clock3 },
];

const TAB_META = {
  home: {
    title: "ZapRoll Home",
    subtitle: "Check your latest attendance status and start a scan.",
    badge: "Home",
  },
  scan: {
    title: "Student QR Scanner",
    subtitle: "Scan the active classroom QR and confirm attendance.",
    badge: "Scanner",
  },
  history: {
    title: "ZapRoll History",
    subtitle: "View recent attendance records and timestamps.",
    badge: "History",
  },
};

export default function StudentScreen({
  activeQrSession,
  scanEvents,
  onScanQrPayload,
  onLogout,
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [activeTab, setActiveTab] = useState("home");
  const [scanFeedback, setScanFeedback] = useState({ type: "success", message: latestStatus.message });
  const [isScanLocked, setIsScanLocked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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

  const applyFeedback = (type, message) => {
    setScanFeedback({ type, message });

    successAnim.setValue(0);
    Animated.timing(successAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const processScanPayload = (encodedPayload) => {
    if (!onScanQrPayload) {
      applyFeedback("error", "Scanner service unavailable.");
      return;
    }

    const result = onScanQrPayload({
      encodedPayload,
      studentId: "ST-078",
      studentName: "Katrina Santos",
    });

    if (result.ok) {
      applyFeedback("success", result.message);
      return;
    }

    applyFeedback("error", result.message);
  };

  const handleBarcodeScanned = ({ data }) => {
    if (!data || isScanLocked) {
      return;
    }

    setIsScanLocked(true);
    processScanPayload(data);

    setTimeout(() => {
      setIsScanLocked(false);
    }, 1200);
  };

  const handleSimulateScan = () => {
    if (!activeQrSession || isScanLocked) {
      return;
    }

    setIsScanLocked(true);
    processScanPayload(activeQrSession.encoded);

    setTimeout(() => {
      setIsScanLocked(false);
    }, 900);
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

  const historyRows = useMemo(() => {
    const liveRows = (scanEvents || []).map((event) => ({
      id: `LIVE-${event.id}`,
      className: event.className,
      status: "Present",
      time: event.time,
      date: event.date,
      source: "Live QR",
    }));

    return [...liveRows, ...attendanceHistory];
  }, [scanEvents]);

  const scrollPadding = useMemo(
    () => ({
      paddingHorizontal: isCompact ? theme.spacing.md : theme.spacing.lg,
      paddingTop: isCompact ? theme.spacing.md : theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    }),
    [isCompact]
  );

  const activeTabMeta = TAB_META[activeTab];

  const renderScannerBody = () => {
    if (!permission) {
      return (
        <View className="w-full items-center justify-center rounded-2xl border border-primary/20 bg-card" style={styles.scannerFrame}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text className="mt-3 text-sm text-textSecondary font-sans">Preparing camera...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="w-full items-center justify-center rounded-2xl border border-primary/20 bg-card px-4" style={styles.scannerFrame}>
          <ShieldAlert size={28} color={theme.colors.danger} />
          <Text className="mt-3 text-center text-base font-semibold text-textPrimary font-sans">Camera permission required</Text>
          <Text className="mt-2 text-center text-sm text-textSecondary font-sans">
            Allow camera access to scan attendance QR codes.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={requestPermission}
            className="mt-4 rounded-2xl bg-primary px-4 py-3"
          >
            <Text className="text-center text-sm font-semibold text-white font-sans">Grant camera access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="w-full overflow-hidden rounded-2xl border border-primary/20 bg-card" style={styles.scannerFrame}>
        <CameraView
          style={styles.cameraView}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={isScanLocked ? undefined : handleBarcodeScanned}
        />
        <View pointerEvents="none" style={styles.cameraOverlay}>
          <View style={styles.scanWindow} />
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === "home") {
      return (
        <GlassCard className="mb-6 overflow-hidden" style={[styles.homeCard, cardStyle(cardAnims[0])]}>
          <View style={styles.homeGlow} />

          <View className="mb-4 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
            <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <House size={18} color={theme.colors.primary} />
                </View>
                <Text className="text-lg font-semibold text-textPrimary font-sans">Welcome Back</Text>
              </View>
              <Text className="mt-2 text-sm text-textSecondary font-sans">
                You are ready to check in. Open the scanner when class starts.
              </Text>
            </View>
            <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
              <Text className="text-xs font-semibold text-primary font-sans">Home</Text>
            </View>
          </View>

          <View className="rounded-2xl border border-success/20 bg-success/10 p-4">
            <Text className="text-sm text-textSecondary font-sans">Last class: {latestStatus.className}</Text>
            <Text className="mt-1 text-sm text-textSecondary font-sans">Checked in: {latestStatus.time}</Text>
            <Text className="mt-2 text-sm font-semibold text-success font-sans">{scanFeedback.message}</Text>
          </View>

          <View className="mt-4 flex-row gap-3" style={isCompact ? styles.stackActionRow : null}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveTab("scan")}
              className="flex-1 rounded-2xl bg-primary px-4 py-4"
              style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
            >
              <View className="flex-row items-center justify-center gap-2">
                <QrCode size={18} color="#FFFFFF" />
                <Text className="text-center text-base font-semibold text-white font-sans">Open Scanner</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveTab("history")}
              className="flex-1 rounded-2xl border border-border bg-card px-4 py-4"
              style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Clock3 size={18} color={theme.colors.textPrimary} />
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">View History</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>
      );
    }

    if (activeTab === "scan") {
      return (
        <GlassCard className="mb-6 overflow-hidden" style={[styles.scannerCard, cardStyle(cardAnims[1])]}>
          <View style={styles.scannerGlow} />

          <View className="mb-4 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
            <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Camera size={18} color={theme.colors.primary} />
                </View>
                <Text className="text-lg font-semibold text-textPrimary font-sans">QR Scanner</Text>
              </View>
              <Text className="mt-2 text-sm text-textSecondary font-sans">
                Point camera at teacher QR code to submit attendance in real time.
              </Text>
            </View>
            <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
              <Text className="text-xs font-semibold text-primary font-sans">Scanner</Text>
            </View>
          </View>

          <View className="mb-3 rounded-2xl border border-primary/20 bg-primary/10 p-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
              Active Session
            </Text>
            <Text className="mt-1 text-sm font-semibold text-textPrimary font-sans">
              {activeQrSession ? `${activeQrSession.sessionName} (v${activeQrSession.version})` : "No live session"}
            </Text>
          </View>

          {renderScannerBody()}

          <View className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            {scannerReminders.map((tip, index) => (
              <View
                key={`${index}-${tip.slice(0, 10)}`}
                className={index === scannerReminders.length - 1 ? "flex-row gap-2" : "mb-2 flex-row gap-2"}
              >
                <Text className="text-sm font-semibold text-primary font-sans">{index + 1}.</Text>
                <Text className="flex-1 text-sm text-textSecondary font-sans">{tip}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSimulateScan}
            disabled={!activeQrSession || isScanLocked}
            className={`mt-4 w-full rounded-2xl px-4 py-4 ${
              !activeQrSession || isScanLocked ? "bg-surface" : "bg-primary"
            }`}
            style={styles.actionButton}
          >
            <View className="flex-row items-center justify-center gap-2">
              <CircleCheck size={18} color={!activeQrSession || isScanLocked ? theme.colors.textSecondary : "#FFFFFF"} />
              <Text
                className={`text-center text-base font-semibold font-sans ${
                  !activeQrSession || isScanLocked ? "text-textSecondary" : "text-white"
                }`}
              >
                Simulate Current QR Scan
              </Text>
            </View>
          </TouchableOpacity>

          <Animated.View
            className={`mt-3 flex-row items-center gap-2 rounded-xl px-3 py-3 ${
              scanFeedback.type === "success" ? "bg-success/10" : "bg-danger/10"
            }`}
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
            <CircleCheck
              size={18}
              color={scanFeedback.type === "success" ? theme.colors.success : theme.colors.danger}
            />
            <Text
              className={`text-sm font-semibold font-sans ${
                scanFeedback.type === "success" ? "text-success" : "text-danger"
              }`}
            >
              {scanFeedback.message}
            </Text>
          </Animated.View>
        </GlassCard>
      );
    }

    return (
      <GlassCard className="mb-6 overflow-hidden" style={[styles.historyCard, cardStyle(cardAnims[2])]}>
        <View style={styles.historyGlow} />

        <View className="mb-4 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
          <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                <Clock3 size={18} color={theme.colors.success} />
              </View>
              <Text className="text-lg font-semibold text-textPrimary font-sans">Attendance History</Text>
            </View>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Recent records for this student account.</Text>
          </View>
          <View className="rounded-full bg-success/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
            <Text className="text-xs font-semibold text-success font-sans">{historyRows.length} items</Text>
          </View>
        </View>

        {historyRows.map((row) => (
          <View key={row.id} className="mb-3 rounded-2xl border border-border bg-card p-4" style={styles.historyRow}>
            <View className="flex-row items-center justify-between" style={isCompact ? styles.compactHistoryRowTop : null}>
              <Text className="text-base font-semibold text-textPrimary font-sans">{row.className}</Text>
              <View className={`rounded-full px-2 py-1 ${row.status === "Late" ? "bg-danger/10" : "bg-success/10"}`}>
                <Text
                  className={`text-xs font-semibold font-sans ${
                    row.status === "Late" ? "text-danger" : "text-success"
                  }`}
                >
                  {row.status}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-sm text-textSecondary font-sans">Date: {row.date}</Text>
            <Text className="text-sm text-textSecondary font-sans">Time: {row.time}</Text>
            {row.source && <Text className="text-xs text-textSecondary font-sans">Source: {row.source}</Text>}
          </View>
        ))}
      </GlassCard>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <Animated.ScrollView
        style={[styles.scrollView, screenStyle]}
        contentContainerStyle={[styles.scrollContent, scrollPadding]}
      >
        <View className="mb-6 overflow-hidden rounded-3xl border border-border bg-card" style={styles.bannerCard}>
          <View style={styles.bannerGlowTop} />
          <View style={styles.bannerGlowBottom} />

          <View className="px-5 pb-5 pt-6" style={isCompact ? styles.bannerPaddingCompact : null}>
            <View className="mb-4 self-start rounded-full border border-white/25 bg-white/20 px-3 py-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-white font-sans">
                ZapRoll Student
              </Text>
            </View>

            <View className="mb-4 flex-row flex-wrap items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
              <View className="flex-1 pr-2" style={isCompact ? styles.compactTitleBlock : null}>
                <Text className="text-3xl font-bold text-white font-sans" style={isCompact ? styles.compactTitleText : null}>
                  ZapRoll Check-In
                </Text>
                <Text className="mt-2 text-sm text-white/90 font-sans">
                  Scan, confirm, and review your ZapRoll attendance in one place.
                </Text>
              </View>
              <TouchableOpacity
                onPress={onLogout}
                activeOpacity={0.9}
                className="self-start rounded-2xl border border-white/25 bg-white/20 px-4 py-4"
                style={[styles.actionButton, isCompact ? styles.compactLogoutButton : null]}
              >
                <View className="flex-row items-center gap-2">
                  <LogOut size={18} color="#FFFFFF" />
                  <Text className="text-xs font-semibold text-white font-sans">Log out</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2" style={isCompact ? styles.compactChipWrap : null}>
              <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
                <Camera size={15} color="#FFFFFF" />
                <Text className="text-xs font-semibold text-white font-sans">Camera ready</Text>
              </View>
              <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
                <QrCode size={15} color="#FFFFFF" />
                <Text className="text-xs font-semibold text-white font-sans">Live QR scanning</Text>
              </View>
              <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
                <Clock3 size={15} color="#FFFFFF" />
                <Text className="text-xs font-semibold text-white font-sans">History available</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-5 flex-row items-start justify-between gap-3" style={isCompact ? styles.compactPageHeader : null}>
          <View className="flex-1 pr-2" style={isCompact ? styles.compactPageHeaderText : null}>
            <Text className="text-xl font-bold text-textPrimary font-sans">{activeTabMeta.title}</Text>
            <Text className="mt-1 text-sm text-textSecondary font-sans">{activeTabMeta.subtitle}</Text>
          </View>
          <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
            <Text className="text-xs font-semibold text-primary font-sans">{activeTabMeta.badge}</Text>
          </View>
        </View>

        {renderTabContent()}
      </Animated.ScrollView>
      <DashboardTabBar tabs={STUDENT_TABS} activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  bannerCard: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.card,
  },
  bannerPaddingCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactHeaderTitle: {
    flexBasis: "100%",
  },
  compactPageHeader: {
    alignItems: "stretch",
  },
  compactPageHeaderText: {
    flexBasis: "100%",
    paddingRight: 0,
  },
  compactTitleBlock: {
    flexBasis: "100%",
    paddingRight: 0,
  },
  compactTitleText: {
    fontSize: 28,
    lineHeight: 32,
  },
  compactBadge: {
    alignSelf: "flex-start",
  },
  compactLogoutButton: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  compactChipWrap: {
    rowGap: theme.spacing.xs,
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  stackActionRow: {
    flexDirection: "column",
  },
  fullWidthButton: {
    width: "100%",
  },
  bannerGlowTop: {
    position: "absolute",
    right: -24,
    top: -42,
    width: 164,
    height: 164,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  bannerGlowBottom: {
    position: "absolute",
    left: -54,
    bottom: -64,
    width: 178,
    height: 178,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  homeCard: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  homeGlow: {
    position: "absolute",
    right: -30,
    top: -34,
    width: 114,
    height: 114,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  scannerCard: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  scannerGlow: {
    position: "absolute",
    right: -34,
    top: -36,
    width: 124,
    height: 124,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  scannerFrame: {
    height: 260,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanWindow: {
    width: "72%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  historyCard: {
    borderColor: "rgba(22, 163, 74, 0.22)",
  },
  historyGlow: {
    position: "absolute",
    right: -30,
    top: -34,
    width: 118,
    height: 118,
    borderRadius: 999,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
  },
  historyRow: {
    borderColor: "rgba(229, 231, 235, 0.9)",
  },
  compactHistoryRowTop: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
});

