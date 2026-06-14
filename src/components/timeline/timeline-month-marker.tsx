import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../../lib/theme/tokens";
import { DATE_W, NODE_W } from "./layout";

interface Props {
  label: string;
  sub?: string;
  accent?: boolean;
}

// Prototype TLMarker (04-timeline.js:43-59): diamond node on the spine + a label
// block with a left accent border. Used between months (day view) and as the
// month-view section header.
export function TimelineMonthMarker({ label, sub, accent = false }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 14 }}>
      <View style={{ width: DATE_W }} />
      <View style={{ width: NODE_W, alignItems: "center" }}>
        <View
          style={{
            width: 15,
            height: 15,
            transform: [{ rotate: "45deg" }],
            borderRadius: 3,
            backgroundColor: accent ? colors.accent : colors.accentSoft,
            borderWidth: 2,
            borderColor: colors.paper,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 1.5,
            elevation: 1,
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 12,
          paddingLeft: 12,
          borderLeftWidth: 2.5,
          borderLeftColor: accent ? colors.accent : colors.accentSoft,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 19,
            fontWeight: "700",
            color: accent ? colors.accentText : colors.ink,
            lineHeight: 22,
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 11,
              color: accent ? colors.accentText : colors.ink2,
              marginTop: 2,
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
