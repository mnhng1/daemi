import React from "react";
import { View, Text } from "react-native";
import { colors, fonts, cardShadow } from "../../lib/theme/tokens";

interface Props {
  text: string;
  rotate?: number;
  color?: string;
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
}

// Prototype Sticker (02-ui-primitives.js:256+): absolutely-positioned rotated label
// with a highlight (washi-tape) background.
export function Sticker({ text, rotate = 0, color, top, right, left, bottom }: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        cardShadow,
        {
          position: "absolute",
          top,
          right,
          left,
          bottom,
          transform: [{ rotate: `${rotate}deg` }],
          backgroundColor: color ?? colors.highlight,
          paddingVertical: 3,
          paddingHorizontal: 9,
          borderRadius: 4,
        },
      ]}
    >
      <Text style={{ fontFamily: fonts.ui, fontSize: 11, fontWeight: "600", color: colors.ink }}>
        {text}
      </Text>
    </View>
  );
}
