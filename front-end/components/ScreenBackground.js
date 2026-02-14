import { View } from "react-native";

export default function ScreenBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0 bg-background" />
  );
}
