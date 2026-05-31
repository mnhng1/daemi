import { View } from "react-native";
import { colors } from "../../lib/theme/tokens";

interface Props {
  showTop?: boolean;
  showBottom?: boolean;
  nodeColor?: string;
}

export function TimelineSpine({ showTop = true, showBottom = true, nodeColor = colors.ink3 }: Props) {
  return (
    <View className="w-[44px] items-center" accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
      {showTop && <View className="w-[2px] flex-1 bg-ink-4" />}
      <View
        className="w-[13px] h-[13px] rounded-full border-2"
        style={{ borderColor: nodeColor, backgroundColor: colors.paper }}
      />
      {showBottom && <View className="w-[2px] flex-1 bg-ink-4" />}
    </View>
  );
}
