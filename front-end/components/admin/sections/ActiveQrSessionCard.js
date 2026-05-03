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
  session,
  styles,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrDataUri, setQrDataUri] = useState("");
  const [qrImageFailed, setQrImageFailed] = useState(false);

  const qrMatrix = useMemo(() => {
    if (!activeQrSession?.encoded) return null;
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
    const tick = () => setSecondsLeft(getSecondsUntilExpiry(activeQrSession.expiresAt));
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
    return () => { isMounted = false; };
  }, [activeQrSession]);

  useEffect(() => {
    if (showNewSessionForm && !newSessionName && session?.user?.subject) {
      setNewSessionName(session.user.subject);
    }
  }, [showNewSessionForm, newSessionName, session?.user?.subject, setNewSessionName]);

  const items = useMemo(() => {
    const seen = new Set();
    return (sectionList && sectionList.length > 0 ? sectionList : sessions || [])
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
  }, [sectionList, sessions]);

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[localStyles.card, cardStyle(cardAnim)]}>
      <View style={localStyles.cardGlow} />
      
      {/* Header Section */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <QrCode size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-bold text-textPrimary font-sans">Session Control</Text>
            <Text className="text-[11px] text-textSecondary font-sans">Live QR attendance management</Text>
          </View>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
          <Text className="text-[10px] font-bold uppercase text-primary font-sans">Live Monitor</Text>
        </View>
      </View>

      {/* Class Selection Grid-List */}
      <View className="mb-4">
        <Text className="mb-3 text-[11px] font-bold uppercase tracking-widest text-textSecondary font-sans ml-1">
          Target Class
        </Text>
        <View className="rounded-3xl border border-border bg-card/50 overflow-hidden" style={{ maxHeight: 180 }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {items.map((item, index) => {
              const isSelected = selectedSession.id === item.id || selectedSession.className === item.name;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    const matchingSession = (sessions || []).find(s => s.className === item.name);
                    handleSelectSession(matchingSession ?? {
                      id: item.id, className: item.name, present: 0, total: 0, status: "Active", isLastPeriod: false,
                    });
                  }}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between px-4 py-4 ${index > 0 ? "border-t border-border/50" : ""} ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className={`h-2 w-2 rounded-full ${isSelected ? "bg-primary" : "bg-textSecondary/30"}`} />
                    <Text className={`text-sm font-semibold font-sans ${isSelected ? "text-primary" : "text-textPrimary"}`}>
                      {item.name}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
            {items.length === 0 && (
              <View className="p-4 items-center">
                <Text className="text-sm text-textSecondary font-sans">No classes configured yet.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Configuration Section */}
      <View className="mb-4">
        <TouchableOpacity
          onPress={() => setShowNewSessionForm(!showNewSessionForm)}
          activeOpacity={0.8}
          className="flex-row items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={16} color={theme.colors.primary} />
            <Text className="text-xs font-bold text-primary font-sans">
              {showNewSessionForm ? "Hide Session Form" : `Configure Session: ${selectedSession?.className || "..."}`}
            </Text>
          </View>
          <View className={`h-2 w-2 rounded-full ${showNewSessionForm ? "bg-primary" : "bg-primary/30"}`} />
        </TouchableOpacity>

        {showNewSessionForm && (
          <View className="mt-3 rounded-3xl border border-primary/10 bg-primary/5 p-4">
            <Text className="mb-2 text-[10px] font-bold uppercase text-textSecondary font-sans">Class Subject</Text>
            <TextInput
              value={newSessionName}
              onChangeText={setNewSessionName}
              placeholder={`e.g., ${session?.user?.subject || "General Education"}`}
              placeholderTextColor="#9CA3AF"
              className="mb-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-textPrimary font-sans"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => { setShowNewSessionForm(false); setNewSessionName(""); }}
                className="flex-1 rounded-xl bg-card border border-border py-3 items-center"
              >
                <Text className="text-sm font-bold text-textSecondary font-sans">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateSession}
                disabled={!newSessionName.trim()}
                className={`flex-1 rounded-xl py-3 items-center ${newSessionName.trim() ? "bg-primary" : "bg-primary/30"}`}
              >
                <Text className="text-sm font-bold text-white font-sans">Open Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Live Monitor / QR Section */}
      <View className="rounded-3xl border border-border bg-surface/30 p-5">
        <View className="mb-4 flex-row justify-between">
          <View>
            <Text className="text-[10px] font-bold uppercase text-textSecondary font-sans">Current Context</Text>
            <Text className="text-sm font-bold text-textPrimary font-sans">
              {sessionName || selectedSession.className || "Select a class"}
            </Text>
          </View>
          {activeQrSession && (
            <View className="items-end">
              <Text className="text-[10px] font-bold uppercase text-success font-sans">Status: Live</Text>
              <Text className="text-[10px] text-textSecondary font-sans">ID: {selectedSession.id || "—"}</Text>
            </View>
          )}
        </View>

        <Animated.View
          style={[
            localStyles.qrMonitor,
            {
              opacity: qrAnim,
              transform: [{ scale: qrAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
            },
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : activeQrSession ? (
            <View className="items-center">
              <View style={localStyles.qrBezel}>
                {qrDataUri && !qrImageFailed ? (
                  <Image source={{ uri: qrDataUri }} style={localStyles.qrImage} resizeMode="contain" />
                ) : qrMatrix ? (
                  <View style={localStyles.qrMatrixBox}>
                    {qrMatrix.rows.map((row, rIdx) => (
                      <View key={rIdx} style={localStyles.qrMatrixRow}>
                        {row.map((f, cIdx) => (
                          <View key={cIdx} style={[localStyles.qrMatrixCell, {
                            width: 130 / qrMatrix.size, height: 130 / qrMatrix.size,
                            backgroundColor: f ? theme.colors.textPrimary : "#FFFFFF",
                          }]} />
                        ))}
                      </View>
                    ))}
                  </View>
                ) : <ActivityIndicator size="small" color={theme.colors.primary} />}
              </View>
              <View className="mt-4 items-center">
                <Text className="text-base font-bold text-textPrimary font-sans">v{activeQrSession.version}</Text>
                <View className="mt-1 flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                  <View className="h-1.5 w-1.5 rounded-full bg-success" />
                  <Text className="text-xs font-bold text-success font-sans">Rotating in {secondsLeft}s</Text>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center p-6">
              <View className="h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 border border-dashed border-primary/30">
                <QrCode size={32} color={theme.colors.primary} />
              </View>
              <Text className="mt-4 text-sm font-semibold text-textSecondary font-sans text-center">
                Ready to begin?{'\n'}Generate a code to start taking attendance.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const isOpened = sessions?.some(s => s.id === selectedSession?.id);
              if (!isOpened) {
                setShowNewSessionForm(true);
                // Optionally could use an alert, but toggling the form is a good nudge.
                return;
              }
              handleGenerateQr({ sessionId: selectedSession.id, sessionName: sessionName || selectedSession.className });
            }}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4 shadow-sm ${
              !sessions?.some(s => s.id === selectedSession?.id) 
                ? "bg-primary/50" 
                : "bg-primary shadow-primary/20"
            }`}
          >
            <QrCode size={18} color="#FFFFFF" />
            <Text className="text-base font-bold text-white font-sans">
              {activeQrSession 
                ? "Rotate Key" 
                : (!sessions?.some(s => s.id === selectedSession?.id) ? "Open Class First" : "Start Session")}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleInvalidateQr}
            className="w-14 items-center justify-center rounded-2xl border border-danger/20 bg-danger/10"
          >
            <Ban size={20} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const localStyles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.15)",
  },
  cardGlow: {
    position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  qrMonitor: {
    minHeight: 220, justifyContent: "center", alignItems: "center", borderRadius: 24, backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  qrBezel: {
    padding: 12, borderRadius: 24, backgroundColor: "#FFFFFF", borderWeight: 1, borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  qrImage: { width: 130, height: 130 },
  qrMatrixBox: { width: 130, height: 130, backgroundColor: "#FFFFFF" },
  qrMatrixRow: { flexDirection: "row" },
  qrMatrixCell: { backgroundColor: "#FFFFFF" },
});

