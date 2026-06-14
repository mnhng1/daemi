import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import {
  monthTypeCounts,
  monthTripMarker,
  scaffoldMonths,
  MonthScaffoldRow,
} from "../../features/memories";
import { colors, fonts } from "../../lib/theme/tokens";
import { TimelineNode } from "./timeline-node";
import { TimelineSpineLine } from "./timeline-spine-line";

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

// A non-empty month's bar never shrinks below this fraction of the track, so a
// 1-memory month is still a visible stub next to a busy one.
const MIN_BAR_FRACTION = 0.12;

// Each row carries whether it should print its year (only on the first row of a
// year-run, so the date column isn't a wall of repeated years).
interface YearRow extends MonthScaffoldRow {
  showYear: boolean;
}

export function TimelineYearView({ memories, anniversaryMonth, onZoomMonth }: Props) {
  const rows = useMemo<YearRow[]>(() => {
    const scaffold = scaffoldMonths(memories, new Date());
    return scaffold.map((row, i) => ({
      ...row,
      showYear: i === 0 || scaffold[i - 1].year !== row.year,
    }));
  }, [memories]);

  // Busiest month sets the full-length reference for the volume bar.
  const maxTotal = useMemo(
    () => Math.max(1, ...rows.map((r) => r.items.length)),
    [rows]
  );

  return (
    <ScrollView
      // flexGrow + space-between: when the months don't fill the screen, the
      // extra height is distributed between rows (current month pinned top,
      // oldest pinned bottom) so the view never looks cramped to the top.
      contentContainerStyle={{
        flexGrow: 1,
        position: "relative",
        justifyContent: "space-between",
        paddingTop: 4,
        paddingBottom: 28,
        paddingRight: 16,
      }}
    >
      <TimelineSpineLine />

      {rows.map((item) => {
        const counts = monthTypeCounts(item.items);
        const marker = item.isEmpty
          ? null
          : monthTripMarker(item.items, anniversaryMonth, item.month);
        const dateColor = item.isCurrentMonth
          ? colors.accent
          : item.isEmpty
            ? colors.ink3
            : colors.ink;
        const fillPct = item.isEmpty
          ? 0
          : Math.max(counts.total / maxTotal, MIN_BAR_FRACTION) * 100;

        return (
          // Empty months are non-interactive placeholders; real months zoom in.
          <Pressable
            key={item.monthKey}
            disabled={item.isEmpty}
            onPress={item.isEmpty ? undefined : onZoomMonth}
            accessibilityRole={item.isEmpty ? "none" : "button"}
            accessibilityLabel={
              item.isEmpty
                ? `${MON[item.month]} ${item.year}, no memories`
                : `${MON[item.month]} ${item.year}, ${counts.total} memories. Tap to zoom in.`
            }
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginVertical: 6,
              opacity: item.isEmpty ? 0.55 : 1,
            }}
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
                  fontFamily: fonts.display,
                  fontSize: 15,
                  fontWeight: "700",
                  lineHeight: 16,
                  color: dateColor,
                }}
              >
                {MON[item.month]}
              </Text>
              {item.showYear ? (
                <Text style={{ fontFamily: fonts.ui, fontSize: 9, color: colors.ink3 }}>
                  {item.year}
                </Text>
              ) : null}
            </View>

            {/* Spine node */}
            <View style={{ width: 20, alignItems: "center", paddingTop: 3 }}>
              <TimelineNode filled={!item.isEmpty} accent={item.isCurrentMonth} sm />
            </View>

            {/* Gap */}
            <View style={{ width: 12, flexShrink: 0 }} />

            {/* Right content: density bar + caption */}
            <View style={{ flex: 1, minWidth: 0 }}>
              {item.isEmpty ? (
                /* Faint placeholder track for a month with no memories */
                <View
                  style={{
                    height: 22,
                    borderRadius: 7,
                    borderWidth: 1,
                    borderColor: colors.line,
                    backgroundColor: colors.surface,
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      marginHorizontal: 10,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: colors.line,
                    }}
                  />
                </View>
              ) : (
                /* Volume bar: full-width rail with a fill whose LENGTH = how many
                   memories (vs the busiest month), and whose SEGMENTS = type mix. */
                <View
                  style={{
                    height: 22,
                    borderRadius: 7,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.line,
                    backgroundColor: colors.surface,
                  }}
                >
                  <View style={{ width: `${fillPct}%`, height: "100%", flexDirection: "row" }}>
                    {TYPES.map((type) =>
                      counts[type] > 0 ? (
                        <View
                          key={type}
                          style={{ flex: counts[type], backgroundColor: SEG_COLOR[type] }}
                        />
                      ) : null
                    )}
                  </View>
                </View>
              )}

              {/* Caption row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.ink2 }}>
                  {item.isEmpty
                    ? "—"
                    : `${counts.total} ${counts.total === 1 ? "memory" : "memories"}`}
                </Text>
                {marker && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Text style={{ fontSize: 10, color: colors.accent }}>♥</Text>
                    <Text
                      style={{ fontFamily: fonts.ui, fontSize: 10, color: colors.accent, fontWeight: "600" }}
                    >
                      {marker}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
