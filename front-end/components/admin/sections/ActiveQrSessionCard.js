import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ban, Check, Plus, QrCode } from "lucide-react-native";
import QR from "qrcode";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";
import { getSecondsUntilExpiry } from "../../../utils/qrSession";

export const ActiveQrSessionCard = ({
  cardStyle,
  cardAnim,
  sessions,
  sectionList,
  selectedSession,
  handleSelectSession,
  showNewSessionForm,
  setShowNewSessionForm,
  newSessionName,
  setNewSessionName,
  handleCreateSession,
  allowRename,
  sessionName,
  setSessionName,
  isGenerating,
  activeQrSession,
  qrAnim,
  handleGenerateQr,
  handleInvalidateQr,
  styles,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrDataUri, setQrDataUri] = useState("");
  const [qrImageFailed, setQrImageFailed] = useState(false);

  const qrMatrix = useMemo(() => {
    if (!activeQrSession?.encoded) {
      return null;
    }

    try {
      const qrModel = QR.create(activeQrSession.encoded, { errorCorrectionLevel: "M" });
      const size = qrModel.modules.size;
      const rows = [];

      for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
        const row = [];

        for (let colIndex = 0; colIndex < size; colIndex += 1) {
          row.push(Boolean(qrModel.modules.get(rowIndex, colIndex)));
        }

        rows.push(row);
      }

      return { size, rows };
    } catch (error) {
      return null;
    }
  }, [activeQrSession]);

  useEffect(() => {
    if (!activeQrSession) {
      setSecondsLeft(0);
      return undefined;
    }

    const tick = () => {
      setSecondsLeft(getSecondsUntilExpiry(activeQrSession.expiresAt));
    };

    tick();
    const interval = setInterval(tick, 500);

    return () => clearInterval(interval);
  }, [activeQrSession]);

  useEffect(() => {
    let isMounted = true;

    const buildQrDataUri = async () => {
      if (!activeQrSession?.encoded) {
        setQrDataUri("");
        setQrImageFailed(false);
        return;
      }

      try {
        const uri = await QR.toDataURL(activeQrSession.encoded, {
          width: 340,
          margin: 2,
          errorCorrectionLevel: "M",
        });

        if (isMounted) {
          setQrImageFailed(false);
          setQrDataUri(uri.startsWith("data:image") ? uri : `data:image/png;base64,${uri}`);
        }
      } catch (error) {
        if (isMounted) {
          setQrImageFailed(true);
          setQrDataUri("");
        }
      }
    };

    buildQrDataUri();

    return () => {
      isMounted = false;
    };
  }, [activeQrSession]);

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[localStyles.card, cardStyle(cardAnim)]}>
      <View style={localStyles.cardGlow} />
      <View
        className="mb-4 flex-row items-start justify-between gap-3"
        style={isCompact ? localStyles.compactHeaderRow : null}
      >
        <View className="flex-1" style={isCompact ? localStyles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <QrCode size={20} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Active QR Session</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Pick a class, generate the live code, and control access instantly.
          </Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? localStyles.compactChip : null}>
          <Text className="text-xs font-semibold text-primary font-sans">Live Control</Text>
        </View>
      </View>

      <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
        Quick Select Class
      </Text>
      {/* Deduplicated class list — scrollable, compact rows */}
      {(() => {
        const seen = new Set();
        const items = (sectionList && sectionList.length > 0 ? sectionList : sessions || [])
          .filter((item) => {
            const id = item.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          })
          .map((item) => ({
            id: item.id,
            name: item.name || item.className,
          }));

        if (items.length === 0) {
          return (
            <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-3">
              <Text className="text-sm text-textSecondary font-sans">No classes available.</Text>
            </View>
          );
        }

        return (
          <View className="mb-4 rounded-2xl border border-border bg-card overflow-hidden" style={{ maxHeight: 200 }}>
            <ScrollView
              scrollEnabled
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {items.map((item, index) => {
                const isSelected =
                  selectedSession.id === item.id ||
                  selectedSession.className === item.name;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      const matchingSession = (sessions || []).find(
                        (s) => s.className === item.name
                      );
                      handleSelectSession(
                        matchingSession ?? {
                          id: item.id,
                          className: item.name,
                          present: 0,
                          total: 0,
                          status: "Active",
                          isLastPeriod: false,
                        }
                      );
                    }}
                    activeOpacity={0.7}
                    className={`flex-row items-center justify-between px-4 py-3 ${
                      index > 0 ? "border-t border-border" : ""
                    } ${isSelected ? "bg-primary/10" : "bg-card"}`}
                  >
                    <Text
                      className={`flex-1 text-sm font-semibold font-sans ${
                        isSelected ? "text-primary" : "text-textPrimary"
                      }`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        );
      })()}
      {/* Create New Session — opens a subject picker for the selected section */}
      <TouchableOpacity
        onPress={() => setShowNewSessionForm(!showNewSessionForm)}
        className="mb-4 flex-row items-center gap-2 rounded-2xl border border-primary bg-primary/10 px-4 py-3"
      >
        <Plus size={14} color={theme.colors.primary} />
        <Text className="text-xs font-bold text-primary font-sans">
          Open Session for {selectedSession?.className || "selected class"}
        </Text>
      </TouchableOpacity>
      {showNewSessionForm && (
        <View className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Class
          </Text>
          <Text className="mb-3 text-sm font-semibold text-textPrimary font-sans">
            {selectedSession?.className || "—"}
          </Text>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
            Subject
          </Text>
          <TextInput
            value={newSessionName}
            onChangeText={setNewSessionName}
            placeholder="e.g., Mathematics, Physics..."
            placeholderTextColor="#9CA3AF"
            className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
          />
          <Text className="mb-3 text-xs text-textSecondary font-sans">
            This will open a class session for today ({new Date().toLocaleDateString()}).
          </Text>
          <View className="flex-row gap-2" style={isCompact ? localStyles.stackActionRow : null}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => { setShowNewSessionForm(false); setNewSessionName(""); }}
              className="flex-1 rounded-2xl border border-border bg-card px-3 py-2"
              style={[localStyles.actionButton, isCompact ? localStyles.fullWidthButton : null]}
            >
              <Text className="text-center text-sm font-semibold text-textPrimary font-sans">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCreateSession}
              disabled={!newSessionName.trim()}
              className={`flex-1 rounded-2xl px-3 py-2 ${newSessionName.trim() ? "bg-primary" : "bg-surface"}`}
              style={[localStyles.actionButton, isCompact ? localStyles.fullWidthButton : null]}
            >
              <Text className={`text-center text-sm font-semibold font-sans ${newSessionName.trim() ? "text-white" : "text-textSecondary"}`}>
                Open Session
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View className="mb-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Session name
        </Text>
        {allowRename ? (
          <TextInput
            value={sessionName}
            onChangeText={setSessionName}
            placeholder="Enter class name"
            placeholderTextColor="#9CA3AF"
            className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
          />
        ) : (
          <Text className="mb-3 text-sm font-semibold text-textPrimary font-sans">
            {selectedSession.className}
          </Text>
        )}
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Class: {selectedSession.className}
        </Text>
        <Text className="mb-4 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Session ID: {selectedSession.id}
        </Text>
        <Animated.View
          className="mt-4 items-center justify-center rounded-2xl border border-primary/20 bg-card"
          style={[
            styles.qrContainer,
            {
              opacity: qrAnim,
              transform: [
                {
                  scale: qrAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.98, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : activeQrSession ? (
            <View className="items-center">
              <View className="rounded-2xl border border-border bg-card p-3">
                {qrDataUri && !qrImageFailed ? (
                  <Image
                    source={{ uri: qrDataUri }}
                    style={localStyles.qrImage}
                    resizeMode="contain"
                    onError={() => setQrImageFailed(true)}
                  />
                ) : qrMatrix ? (
                  <View style={localStyles.qrMatrixBox}>
                    {qrMatrix.rows.map((row, rowIndex) => (
                      <View key={`row-${rowIndex}`} style={localStyles.qrMatrixRow}>
                        {row.map((filled, colIndex) => (
                          <View
                            key={`cell-${rowIndex}-${colIndex}`}
                            style={[
                              localStyles.qrMatrixCell,
                              {
                                width: 138 / qrMatrix.size,
                                height: 138 / qrMatrix.size,
                                backgroundColor: filled ? theme.colors.textPrimary : "#FFFFFF",
                              },
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                ) : (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                )}
              </View>
              <Text className="mt-3 text-sm font-semibold text-textPrimary font-sans">Live QR Code v{activeQrSession.version}</Text>
              <Text className="mt-1 text-xs font-semibold text-textSecondary font-sans">Expires in {secondsLeft}s</Text>
              <Text className="mt-1 text-xs text-textSecondary font-sans">Nonce: {activeQrSession.nonce}</Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <QrCode size={24} color={theme.colors.primary} />
              </View>
              <Text className="mt-3 text-sm font-semibold text-textPrimary font-sans">Generate a live QR code</Text>
            </View>
          )}
        </Animated.View>
        <View className="mt-4 flex-row gap-3" style={isCompact ? localStyles.stackActionRow : null}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              handleGenerateQr({
                sessionId: selectedSession.id,
                sessionName: sessionName || selectedSession.className,
              })
            }
            className="flex-1 rounded-2xl bg-primary px-4 py-4"
            style={[localStyles.actionButton, isCompact ? localStyles.fullWidthButton : null]}
          >
            <View className="flex-row items-center justify-center gap-2">
              <QrCode size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">
                {activeQrSession ? "Rotate QR" : "Generate QR"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleInvalidateQr}
            className="flex-1 rounded-2xl border border-danger bg-danger/90 px-4 py-4"
            style={[localStyles.actionButton, isCompact ? localStyles.fullWidthButton : null]}
          >
            <View className="flex-row items-center justify-center gap-2">
              <Ban size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">Invalidate</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const localStyles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactHeaderTitle: {
    flexBasis: "100%",
  },
  compactChip: {
    alignSelf: "flex-start",
  },
  sessionPill: {
    minHeight: 40,
    justifyContent: "center",
  },
  stackActionRow: {
    flexDirection: "column",
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  fullWidthButton: {
    width: "100%",
  },
  cardGlow: {
    position: "absolute",
    right: -38,
    top: -40,
    width: 124,
    height: 124,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  qrImage: {
    width: 138,
    height: 138,
  },
  qrMatrixBox: {
    width: 138,
    height: 138,
    backgroundColor: "#FFFFFF",
  },
  qrMatrixRow: {
    flexDirection: "row",
  },
  qrMatrixCell: {
    backgroundColor: "#FFFFFF",
  },
});

