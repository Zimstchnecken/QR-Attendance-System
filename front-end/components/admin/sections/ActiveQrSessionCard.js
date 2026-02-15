import React from "react";
import { ActivityIndicator, Animated, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ban, QrCode } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";
import { sessionRows } from "../../../data/admin";

export const ActiveQrSessionCard = ({
  cardStyle,
  cardAnim,
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
  qrAnim,
  handleGenerateQr,
  handleInvalidateQr,
  styles,
}) => (
  <GlassCard className="mb-6" style={cardStyle(cardAnim)}>
    <View className="mb-3 flex-row items-center gap-2">
      <QrCode size={20} color={theme.colors.primary} />
      <Text className="text-lg font-semibold text-textPrimary font-sans">Active QR Session</Text>
    </View>
    <View className="mb-4 flex-row gap-2 flex-wrap">
      {sessionRows.map((session) => (
        <TouchableOpacity
          key={session.id}
          onPress={() => handleSelectSession(session)}
          className={`rounded-2xl px-4 py-2 border ${
            selectedSession.id === session.id ? "bg-primary border-primary" : "bg-card border-border"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              selectedSession.id === session.id ? "text-white" : "text-textSecondary"
            } font-sans`}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {session.className}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => setShowNewSessionForm(!showNewSessionForm)}
        className="rounded-2xl px-3 py-2 border border-primary bg-primary/10"
      >
        <Text className="text-xs font-bold text-primary font-sans">+ New</Text>
      </TouchableOpacity>
    </View>
    {showNewSessionForm && (
      <View className="mb-4 rounded-2xl border border-border bg-card p-4">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Session Name
        </Text>
        <TextInput
          value={newSessionName}
          onChangeText={setNewSessionName}
          placeholder="e.g., Class 10A"
          placeholderTextColor="#9CA3AF"
          className="mb-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-textPrimary font-sans"
        />
        <View className="flex-row gap-2">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowNewSessionForm(false)}
            className="flex-1 rounded-2xl border border-border bg-card px-3 py-2"
          >
            <Text className="text-center text-sm font-semibold text-textPrimary font-sans">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleCreateSession}
            className="flex-1 rounded-2xl bg-primary px-3 py-2"
          >
            <Text className="text-center text-sm font-semibold text-white font-sans">Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
    <View className="mb-4 rounded-2xl border border-border bg-card p-4">
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
        className="mt-4 items-center justify-center rounded-2xl bg-surface"
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
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <QrCode size={24} color={theme.colors.primary} />
          </View>
        )}
        {!isGenerating && (
          <Text className="mt-3 text-sm font-semibold text-textPrimary font-sans">Live QR Code</Text>
        )}
      </Animated.View>
      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleGenerateQr}
          className="flex-1 rounded-2xl bg-primary px-4 py-4"
        >
          <View className="flex-row items-center justify-center gap-2">
            <QrCode size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">Generate QR</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleInvalidateQr}
          className="flex-1 rounded-2xl bg-danger px-4 py-4"
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
