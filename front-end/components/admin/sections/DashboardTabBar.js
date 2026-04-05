import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../constants/theme";

export const DashboardTabBar = ({ tabs, activeTab, onChange }) => (
  <View className="border-t border-border bg-card px-2 pb-2 pt-2" style={styles.container}>
    {tabs.map(({ key, label, icon: Icon }) => {
      const isActive = activeTab === key;

      return (
        <TouchableOpacity
          key={key}
          activeOpacity={0.9}
          onPress={() => onChange(key)}
          className={`mx-1 flex-1 items-center justify-center rounded-2xl py-2 ${
            isActive ? "bg-primary/10" : "bg-transparent"
          }`}
          style={styles.tabButton}
        >
          <Icon size={20} color={isActive ? theme.colors.primary : theme.colors.textSecondary} />
          <Text
            className={`mt-1 text-xs font-semibold font-sans ${
              isActive ? "text-primary" : "text-textSecondary"
            }`}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  tabButton: {
    minHeight: 56,
  },
});
