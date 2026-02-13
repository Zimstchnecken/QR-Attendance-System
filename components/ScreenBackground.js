import { View } from "react-native";

export default function ScreenBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <View className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-brand-100 opacity-80" />
      <View className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-brand-200 opacity-60" />
      <View className="absolute bottom-10 right-[-40px] h-72 w-72 rounded-full bg-slate-200 opacity-50" />
      <View className="absolute -bottom-36 -left-16 h-72 w-72 rounded-full bg-brand-100 opacity-60" />
      <View className="absolute left-6 right-6 top-16 h-36 rounded-[36px] bg-white/80" style={{ transform: [{ rotate: "-5deg" }] }} />
      <View className="absolute left-10 right-10 top-48 h-24 rounded-[32px] bg-white/60" style={{ transform: [{ rotate: "2deg" }] }} />
      <View className="absolute right-12 top-8 h-2 w-16 rounded-full bg-brand-500 opacity-40" />
      <View className="absolute right-12 top-14 h-2 w-10 rounded-full bg-brand-700 opacity-40" />
      <View className="absolute left-8 bottom-28 h-1.5 w-14 rounded-full bg-slate-400 opacity-40" />
      <View className="absolute left-8 bottom-24 h-1.5 w-10 rounded-full bg-brand-500 opacity-40" />
    </View>
  );
}
