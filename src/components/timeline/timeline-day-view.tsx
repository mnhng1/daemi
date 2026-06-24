import React from "react";
import {
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { DayRow } from "../../features/memories";
import { MemoryWithAuthor } from "../../types/database";
import type { QueuedMemory } from "../../features/queue";
import { colors, getAppearance } from "../../lib/theme/tokens";
import { TimelineSpineLine } from "./timeline-spine-line";
import { TimelineTodayCap } from "./timeline-today-cap";
import { TimelineMonthMarker } from "./timeline-month-marker";
import { TimelineGhostRow } from "./timeline-ghost-row";
import { TimelineMemoryRow } from "./timeline-memory-row";
import { MemoryCard } from "../memory/memory-card";
import { MemoryGroupCard } from "../memory/memory-carousel";
import { useTabBarSpace } from "../navigation/tab-bar-metrics";

interface Props {
  rows: DayRow[];
  onRefresh: () => void;
  scrollRef: React.RefObject<ScrollView | null>;
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

// Single scroll surface with one continuous absolute gradient spine behind all rows
// (prototype 04-timeline.js:337-347). Note: renders all rows (no virtualization);
// fine for couple-scale data, revisit with a measured-height list past ~1-2k memories.
export function TimelineDayView({ rows, onRefresh, scrollRef, onScroll }: Props) {
  // Monochrome ("Threads-style") day view is a flat, date-less continuous feed:
  // full-width memories separated by 1px hairlines — no spine, nodes, date column,
  // today cap or month markers. Scrapbook keeps the original spine layout below.
  const tabBarSpace = useTabBarSpace();

  if (getAppearance() === "monochrome") {
    return (
      <MonoDayFeed rows={rows} onRefresh={onRefresh} scrollRef={scrollRef} onScroll={onScroll} />
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      contentContainerStyle={{ position: "relative", paddingLeft: 0, paddingRight: 16, paddingTop: 12, paddingBottom: tabBarSpace }}
    >
      <TimelineSpineLine />
      {rows.map((row) => {
        switch (row.kind) {
          case "today":
            return <TimelineTodayCap key={row.key} />;
          case "queued":
            return (
              <TimelineMemoryRow key={row.key} queued>
                <MemoryCard memory={row.item as QueuedMemory} index={0} />
              </TimelineMemoryRow>
            );
          case "month-marker":
            return (
              <TimelineMonthMarker key={row.key} label={row.label} sub={row.sub} accent={row.accent} />
            );
          case "cluster":
            return (
              <TimelineMemoryRow key={row.key} dateLabel={row.dateLabel} dowLabel={row.dowLabel}>
                <MemoryGroupCard memories={row.items} />
              </TimelineMemoryRow>
            );
          case "memory":
            return (
              <TimelineMemoryRow
                key={row.key}
                dateLabel={row.dateLabel}
                dowLabel={row.dowLabel}
                accent={row.accent}
              >
                <MemoryCard memory={row.item as MemoryWithAuthor} index={0} rotation={row.rotation} />
              </TimelineMemoryRow>
            );
          case "ghost":
            return <TimelineGhostRow key={row.key} count={row.count} />;
          default:
            return <View key={(row as DayRow).key} />;
        }
      })}
    </ScrollView>
  );
}

// Renders one day row's content for the monochrome feed (dates/spine stripped).
// Returns null for date-header rows (today cap, month markers) — the mono feed is
// intentionally date-less.
function renderMonoRow(row: DayRow): React.ReactNode {
  switch (row.kind) {
    case "today":
    case "month-marker":
      return null;
    case "queued":
      return (
        <View style={{ opacity: 0.72 }}>
          <Text style={{ fontSize: 11.5, color: colors.ink3, marginBottom: 8 }}>Queued</Text>
          <MemoryCard memory={row.item as QueuedMemory} index={0} />
        </View>
      );
    case "cluster":
      return <MemoryGroupCard memories={row.items} />;
    case "memory":
      return <MemoryCard memory={row.item as MemoryWithAuthor} index={0} />;
    case "ghost":
      return (
        <Text
          style={{ fontSize: 12.5, color: colors.ink3, fontStyle: "italic", textAlign: "center" }}
        >
          {row.count} hidden by filter
        </Text>
      );
    default:
      return null;
  }
}

function MonoDayFeed({ rows, onRefresh, scrollRef, onScroll }: Props) {
  const tabBarSpace = useTabBarSpace();
  return (
    <ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.ink} />
      }
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarSpace }}
    >
      {rows.map((row) => {
        const content = renderMonoRow(row);
        if (!content) return null;
        return (
          <View
            key={row.key}
            style={{
              paddingVertical: 14,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.line,
            }}
          >
            {content}
          </View>
        );
      })}
    </ScrollView>
  );
}
