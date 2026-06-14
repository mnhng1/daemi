import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../../lib/theme/tokens";
import { DATE_W, NODE_W } from "./layout";

// Prototype TodayCap (04-timeline.js:61-74): "now" label + pink "today" pill
// sitting on the spine at the very top of the day view.
export function TimelineTodayCap() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
      <View style={{ width: DATE_W, alignItems: "flex-end", paddingRight: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 13, fontWeight: "700", color: colors.ink3 }}>
          now
        </Text>
      </View>
      <View style={{ width: NODE_W, alignItems: "center" }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 12,
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Text style={{ fontFamily: fonts.ui, fontSize: 10, fontWeight: "700", color: "#fff" }}>
            today
          </Text>
        </View>
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}
