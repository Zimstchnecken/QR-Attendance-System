import { StyleSheet, View } from "react-native";

export default function ScreenBackground() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.base} />
      <View style={styles.orbPrimary} />
      <View style={styles.orbAccent} />
      <View style={styles.orbSoft} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8F4EA",
  },
  orbPrimary: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 999,
    right: -62,
    top: -48,
    backgroundColor: "rgba(15, 118, 110, 0.14)",
  },
  orbAccent: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 999,
    left: -56,
    bottom: -56,
    backgroundColor: "rgba(194, 65, 45, 0.12)",
  },
  orbSoft: {
    position: "absolute",
    width: 152,
    height: 152,
    borderRadius: 999,
    left: "28%",
    top: "22%",
    backgroundColor: "rgba(31, 157, 85, 0.09)",
  },
});
