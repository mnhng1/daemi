import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../../lib/theme/tokens";
import { DATE_W, NODE_W } from "./layout";

interface Props {
  count: number;
}

// Prototype GhostRow (04-timeline.js:352-363): a faded dashed dot + "N hidden by
// filter" shown where a type filter has collapsed non-matching memories.
export function TimelineGhostRow({ count }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, opacity: 0.5 }}>
      <View style={{ width: DATE_W }} />
      <View style={{ width: NODE_W, alignItems: "center" }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: colors.ink3,
          }}
        />
      </View>
      <Text
        style={{
          flex: 1,
          paddingLeft: 22,
          fontFamily: fonts.ui,
          fontSize: 10.5,
          color: colors.ink3,
          fontStyle: "italic",
        }}
      >
        {count} hidden by filter
      </Text>
    </View>
  );
}
