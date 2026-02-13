import { View } from "react-native";

export default function ScreenBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <View className="absolute -top-32 -right-10 h-80 w-80 rounded-full bg-brand-200/55" />
      <View className="absolute top-10 -left-40 h-[440px] w-[440px] rounded-full bg-brand-400/25" />
      <View className="absolute bottom-0 right-[-20px] h-[380px] w-[380px] rounded-full bg-slate-300/45" />
      <View className="absolute -bottom-44 -left-8 h-80 w-80 rounded-full bg-brand-100/55" />
      <View className="absolute left-10 right-10 top-14 h-28 rounded-[44px] bg-brand-100/50" style={{ transform: [{ rotate: "-4deg" }] }} />
      <View className="absolute left-20 right-16 top-48 h-20 rounded-[36px] bg-brand-200/45" style={{ transform: [{ rotate: "3deg" }] }} />
      <View className="absolute left-6 right-6 top-32 h-16 rounded-[999px] bg-brand-400/20" style={{ transform: [{ rotate: "-2deg" }] }} />
      <View className="absolute right-14 top-10 h-[2px] w-32 bg-brand-600/40" />
      <View className="absolute right-14 top-16 h-[2px] w-20 bg-brand-500/35" />
      <View className="absolute left-10 bottom-28 h-[2px] w-24 bg-slate-500/40" />
      <View className="absolute left-10 bottom-24 h-[2px] w-14 bg-brand-500/35" />
    </View>
  );
}
