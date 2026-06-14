import React, { useMemo } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import {
  groupByMonth,
  monthTypeCounts,
  monthTripMarker,
} from "../../features/memories";
import { colors } from "../../lib/theme/tokens";
import { TimelineSpine } from "./timeline-spine";

interface Props {
  memories: MemoryWithAuthor[];
  anniversaryMonth: number | null;
  onZoomMonth: () => void;
}

// Approximation of prototype `color-mix(in srgb, var(--accent) 40%, var(--ink4))`
const LETTER_SEG_COLOR = "#b89aae";

// Segment colors per type (prototype line 228)
const SEG_COLOR: Record<string, string> = {
  photo: colors.ink3,
  video: colors.ink2,
  letter: LETTER_SEG_COLOR,
  ticket: colors.accent,
};

const TYPES = ["photo", "video", "letter", "ticket"] as const;

// Short month names matching prototype DU.fmt.MON
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthRow {
  monthKey: string;
  year: number;
  month: number;
  items: MemoryWithAuthor[];
  isCurrent: boolean;
}

export function TimelineYearView({ memories, anniversaryMonth, onZoomMonth }: Props) {
  const rows = useMemo<MonthRow[]>(() => {
    const groups = groupByMonth(memories);
    return groups.map(({ monthKey, year, month, items }, index) => ({
      monthKey,
      year,
      month,
      items,
      isCurrent: index === 0,
    }));
  }, [memories]);

  return (
    <FlatList<MonthRow>
      data={rows}
      keyExtractor={(item) => item.monthKey}
      contentContainerStyle={{ paddingBottom: 28 }}
      renderItem={({ item }) => {
        const counts = monthTypeCounts(item.items);
        const marker = monthTripMarker(item.items, anniversaryMonth, item.month);
        const nodeColor = item.isCurrent ? colors.accent : colors.ink3;
        const dateColor = item.isCurrent ? colors.accent : colors.ink;

        return (
          <Pressable
            onPress={onZoomMonth}
            accessibilityRole="button"
            accessibilityLabel={`${MON[item.month]} ${item.year}, ${counts.total} memories. Tap to zoom in.`}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 9,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {/* Date column */}
            <View
              style={{
                width: 46,
                flexShrink: 0,
                alignItems: "flex-end",
                paddingRight: 8,
                paddingTop: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  lineHeight: 16,
                  color: dateColor,
                }}
              >
                {MON[item.month]}
              </Text>
              <Text style={{ fontSize: 9, color: colors.ink3 }}>{item.year}</Text>
            </View>

            {/* Spine node */}
            <View style={{ paddingTop: 3 }}>
              <TimelineSpine
                size="sm"
                showTop={false}
                showBottom={false}
                nodeColor={nodeColor}
              />
            </View>

            {/* Gap */}
            <View style={{ width: 12, flexShrink: 0 }} />

            {/* Right content: density bar + caption */}
            <View style={{ flex: 1, minWidth: 0 }}>
              {/* Density bar */}
              <View
                style={{
                  height: 22,
                  borderRadius: 7,
                  overflow: "hidden",
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: colors.line,
                  backgroundColor: colors.surface,
                }}
              >
                {TYPES.map((type) =>
                  counts[type] > 0 ? (
                    <View
                      key={type}
                      style={{ flex: counts[type], backgroundColor: SEG_COLOR[type] }}
                    />
                  ) : null
                )}
              </View>

              {/* Caption row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 3,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.ink2 }}>
                  {counts.total} {counts.total === 1 ? "memory" : "memories"}
                </Text>
                {marker && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 10, color: colors.accent }}>♥</Text>
                    <Text
                      style={{ fontSize: 10, color: colors.accent, fontWeight: "600" }}
                    >
                      {marker}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}
