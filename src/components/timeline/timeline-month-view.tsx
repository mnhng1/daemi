import React, { useMemo } from "react";
import { View, Text, SectionList } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import {
  groupByMonth,
  groupByWeekOfMonth,
  monthTripMarker,
} from "../../features/memories";
import { formatMonthLabel } from "../../lib/utils/date";
import { colors, fonts } from "../../lib/theme/tokens";
import { TimelineNode } from "./timeline-node";
import { TimelineMonthMarker } from "./timeline-month-marker";
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
        return <TimelineMonthMarker label={label} sub={sub} accent={isAccent} />;
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
                fontFamily: fonts.ui,
                fontSize: 10,
                color: colors.ink3,
                fontWeight: "600",
              }}
            >
              {`wk ${item.week}`}
            </Text>
          </View>

          {/* Small spine node */}
          <View style={{ width: 20, alignItems: "center", paddingTop: 6 }}>
            <TimelineNode filled sm />
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
      contentContainerStyle={{ paddingBottom: 28, paddingRight: 16 }}
    />
  );
}
