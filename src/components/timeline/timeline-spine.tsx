import { View } from "react-native";
import { colors } from "../../lib/theme/tokens";

interface Props {
  showTop?: boolean;
  showBottom?: boolean;
  nodeColor?: string;
  size?: "sm" | "md";
}

export function TimelineSpine({
  showTop = true,
  showBottom = true,
  nodeColor = colors.ink3,
  size = "md",
}: Props) {
  const nodeSize = size === "sm" ? 9 : 13;
  const columnWidth = size === "sm" ? 20 : 44;

  return (
    <View
      style={{ width: columnWidth, alignItems: "center" }}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {showTop && <View className="w-[2px] flex-1 bg-ink-4" />}
      <View
        style={{
          width: nodeSize,
          height: nodeSize,
          borderRadius: nodeSize,
          borderWidth: 2,
          borderColor: nodeColor,
          backgroundColor: colors.paper,
        }}
      />
      {showBottom && <View className="w-[2px] flex-1 bg-ink-4" />}
    </View>
  );
}
