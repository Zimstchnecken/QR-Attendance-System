import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { QrCode, ShieldCheck } from "lucide-react-native";

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.orbTop} />
        <View style={styles.orbBottom} />

        <View style={styles.centerWrap}>
          <View style={styles.logoOrb}>
            <View style={styles.logoInner}>
              <QrCode size={42} color="#FFFFFF" />
              <ShieldCheck size={20} color="#BBF7D0" style={styles.shieldIcon} />
            </View>
          </View>

          <Text style={styles.title}>ZapRoll</Text>
          <Text style={styles.subtitle}>Smart attendance flow for modern campuses</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F766E",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#0F766E",
  },
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  orbTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -48,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  orbBottom: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -80,
    bottom: -70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoOrb: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  shieldIcon: {
    position: "absolute",
    right: 14,
    bottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    textAlign: "center",
  },
});