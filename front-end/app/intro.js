import { useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { BellRing, ChartNoAxesCombined, QrCode, ShieldCheck } from "lucide-react-native";
import { ScreenBackground } from "../components";
import { theme } from "../constants/theme";

const INTRO_SLIDES = [
  {
    id: "scan",
    icon: QrCode,
    title: "Fast QR Check-In",
    text: "ZapRoll rotates live class QR codes so check-in feels instant and reliable.",
    tone: "#0F766E",
  },
  {
    id: "secure",
    icon: ShieldCheck,
    title: "Secure & Reliable",
    text: "ZapRoll secures every scan with nonce-aware validation to block replay attempts.",
    tone: "#0C4A6E",
  },
  {
    id: "insights",
    icon: ChartNoAxesCombined,
    title: "Actionable Insights",
    text: "ZapRoll highlights trends, late patterns, and risk signals for faster decisions.",
    tone: "#166534",
  },
  {
    id: "alerts",
    icon: BellRing,
    title: "Connected Communication",
    text: "Send timely updates to parents and staff with ZapRoll communication workflows.",
    tone: "#9A3412",
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

export default function IntroScreen({ onSkip, onContinue }) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = activeIndex === INTRO_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onContinue();
      return;
    }

    const next = activeIndex + 1;
    setActiveIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const renderSlide = ({ item, index }) => {
    const Icon = item.icon;
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const cardTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [18, 0, 18],
      extrapolate: "clamp",
    });

    const cardScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.94, 1, 0.94],
      extrapolate: "clamp",
    });

    const cardOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.58, 1, 0.58],
      extrapolate: "clamp",
    });

    return (
      <View style={[styles.slide, { width }]}> 
        <Animated.View
          style={[
            styles.slideCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}
        >
          <View style={[styles.artBoard, { borderColor: `${item.tone}33` }]}> 
            <View style={[styles.artBackBlock, { backgroundColor: `${item.tone}1A` }]} />
            <View style={[styles.artFrontBlock, { backgroundColor: `${item.tone}2B` }]} />
            <View style={[styles.iconPlate, { backgroundColor: `${item.tone}22` }]}>
              <Icon size={46} color={item.tone} />
            </View>
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideText}>{item.text}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.brandPill}>
            <Text style={styles.brandText}>ZapRoll Tour</Text>
          </View>
          <TouchableOpacity onPress={onSkip} activeOpacity={0.9}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <AnimatedFlatList
          ref={listRef}
          data={INTRO_SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveIndex(nextIndex);
          }}
          renderItem={renderSlide}
        />

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {INTRO_SLIDES.map((slide, index) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleNext} activeOpacity={0.9} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{isLast ? "Get Started" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  headerRow: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandPill: {
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  brandText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  skipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  slideCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
    ...theme.shadow.card,
  },
  artBoard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#F8F2E8",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    position: "relative",
  },
  artBackBlock: {
    position: "absolute",
    width: 108,
    height: 64,
    borderRadius: 16,
    top: 24,
    left: 38,
    transform: [{ rotate: "-6deg" }],
  },
  artFrontBlock: {
    position: "absolute",
    width: 108,
    height: 64,
    borderRadius: 16,
    bottom: 24,
    right: 38,
    transform: [{ rotate: "8deg" }],
  },
  iconPlate: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  slideTitle: {
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    textAlign: "center",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  slideText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: theme.colors.textSecondary,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(93, 104, 120, 0.35)",
  },
  dotActive: {
    width: 22,
    backgroundColor: theme.colors.primary,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});