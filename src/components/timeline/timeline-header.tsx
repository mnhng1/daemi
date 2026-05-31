import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TimelineHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-3">
      <Text className="text-accent text-[28px] font-bold">daemi</Text>
    </View>
  );
}
