import React, { useMemo } from "react";
import { View, Text, SectionList } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import {
  groupByMonth,
  groupByWeekOfMonth,
  monthTripMarker,
} from "../../features/memories";
import { formatMonthLabel } from "../../lib/utils/date";
import { colors } from "../../lib/theme/tokens";
import { TimelineSpine } from "./timeline-spine";
import { TimelineMiniThumb } from "./timeline-mini-thumb";

interface Props {
  memories: MemoryWithAuthor[];
  anniversaryMonth: number | null;
}

// Each section = one month bucket; each data row = one week bucket
interface WeekBucket {
  week: number;
  items: MemoryWithAuthor[];
  sectionKey: string;
}

interface MonthSection {
  key: string;
  year: number;
  month: number;
  totalCount: number;
  marker: "anniversary" | "trip" | null;
  data: WeekBucket[];
}

export function TimelineMonthView({ memories, anniversaryMonth }: Props) {
  const sections = useMemo<MonthSection[]>(() => {
    const groups = groupByMonth(memories);
    return groups.map(({ monthKey, year, month, items }) => {
      const weeks = groupByWeekOfMonth(items);
      const marker = monthTripMarker(items, anniversaryMonth, month);
      return {
        key: monthKey,
        year,
        month,
        totalCount: items.length,
        marker,
        data: weeks.map(({ week, items: weekItems }) => ({
          week,
          items: weekItems,
          sectionKey: monthKey,
        })),
      };
    });
  }, [memories, anniversaryMonth]);

  return (
    <SectionList<WeekBucket, MonthSection>
      sections={sections}
      keyExtractor={(item) => `${item.sectionKey}-wk${item.week}`}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => {
        const isAccent = section.marker === "anniversary";
        const label = formatMonthLabel(section.year, section.month);
        const sub = `${section.totalCount} ${section.totalCount === 1 ? "memory" : "memories"}${section.marker === "anniversary" ? " · anniversary" : ""}`;

        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
              marginBottom: 14,
            }}
          >
            {/* Diamond marker (prototype TLMarker, line 48-50) */}
            <View style={{ width: 46, flexShrink: 0 }} />
            <View style={{ width: 20, flexShrink: 0, alignItems: "center" }}>
              <View
                style={{
                  width: 15,
                  height: 15,
                  transform: [{ rotate: "45deg" }],
                  borderRadius: 3,
                  backgroundColor: isAccent ? colors.accent : colors.accentSoft,
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
            {/* Label block with left accent border */}
            <View
              style={{
                flex: 1,
                marginLeft: 12,
                paddingLeft: 12,
                borderLeftWidth: 2.5,
                borderLeftColor: isAccent ? colors.accent : colors.accentSoft,
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: "700",
                  color: isAccent ? colors.accentText : colors.ink,
                  lineHeight: 20,
                }}
              >
                {label}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: isAccent ? colors.accentText : colors.ink2,
                  marginTop: 2,
                }}
              >
                {sub}
              </Text>
            </View>
          </View>
        );
      }}
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          {/* wk N label — right-aligned in a 46px column */}
          <View style={{ width: 46, flexShrink: 0, alignItems: "flex-end", paddingRight: 8, paddingTop: 4 }}>
            <Text
              style={{
                fontSize: 10,
                color: colors.ink3,
                fontWeight: "600",
              }}
            >
              {`wk ${item.week}`}
            </Text>
          </View>

          {/* Small spine node */}
          <View style={{ paddingTop: 6 }}>
            <TimelineSpine size="sm" showTop={false} showBottom={false} />
          </View>

          {/* Spacer between node and thumbs */}
          <View style={{ width: 14, flexShrink: 0 }} />

          {/* flexWrap row of mini-thumbs */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 7,
              alignItems: "center",
            }}
          >
            {item.items.map((memory) => (
              <TimelineMiniThumb key={memory.id} memory={memory} />
            ))}
          </View>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 28 }}
    />
  );
}
