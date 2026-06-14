import React from "react";
import { View } from "react-native";
import { colors } from "../../lib/theme/tokens";

interface Props {
  filled?: boolean;
  accent?: boolean;
  sm?: boolean;
}

// Prototype Node (04-timeline.js:12-18): a dot with a 3px paper "ring"
// (box-shadow 0 0 0 3px paper) so it punches through the gradient spine.
// The ring is emulated with an outer paper-bg circle.
export function TimelineNode({ filled = false, accent = false, sm = false }: Props) {
  const size = sm ? 9 : 13;
  const borderColor = accent ? colors.accent : colors.ink3;
  const bg = filled ? (accent ? colors.accent : colors.ink3) : colors.paper;
  const ring = 3;

  return (
    <View
      style={{
        width: size + ring * 2,
        height: size + ring * 2,
        borderRadius: (size + ring * 2) / 2,
        backgroundColor: colors.paper,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor,
          backgroundColor: bg,
        }}
      />
    </View>
  );
}
