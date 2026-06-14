import React from "react";
import { View, Text } from "react-native";
import { colors, fonts } from "../../lib/theme/tokens";
import { DATE_W, NODE_W, CONNECTOR_W } from "./layout";
import { TimelineNode } from "./timeline-node";
import { Sticker } from "../ui/sticker";

interface Props {
  dateLabel?: string;
  dowLabel?: string;
  accent?: boolean;
  queued?: boolean;
  children: React.ReactNode;
}

// Prototype TLRow (04-timeline.js:30-41): [date col][node][dashed connector][card].
// The date sits inline, right-aligned, only on the first row of each day.
export function TimelineMemoryRow({ dateLabel, dowLabel, accent = false, queued = false, children }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
      {/* Date column */}
      <View style={{ width: DATE_W, alignItems: "flex-end", paddingRight: 8, paddingTop: 1 }}>
        {dateLabel ? (
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 15,
              fontWeight: "700",
              lineHeight: 16,
              color: accent ? colors.accent : colors.ink,
            }}
          >
            {dateLabel}
          </Text>
        ) : null}
        {dowLabel ? (
          <Text style={{ fontFamily: fonts.ui, fontSize: 9.5, color: colors.ink3, marginTop: 2 }}>
            {dowLabel}
          </Text>
        ) : null}
      </View>

      {/* Node */}
      <View style={{ width: NODE_W, alignItems: "center", paddingTop: 3 }}>
        <TimelineNode filled accent={accent} />
      </View>

      {/* Dashed connector */}
      <View
        style={{
          width: CONNECTOR_W,
          marginTop: 9,
          borderTopWidth: 1.5,
          borderStyle: "dashed",
          borderColor: colors.ink4,
        }}
      />

      {/* Card */}
      <View style={{ flex: 1, paddingRight: 4 }}>
        {queued ? (
          <View style={{ opacity: 0.72 }}>
            {children}
            <Sticker text="queued" rotate={8} top={-7} right={-4} color={colors.surface} />
          </View>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
