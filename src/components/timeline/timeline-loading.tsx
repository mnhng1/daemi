import { View, ActivityIndicator } from "react-native";
import { colors } from "../../lib/theme/tokens";

export function TimelineLoading() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
