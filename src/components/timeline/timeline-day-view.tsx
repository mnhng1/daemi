import React from "react";
import {
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from "react-native";
import type { DayRow } from "../../features/memories";
import { MemoryWithAuthor } from "../../types/database";
import type { QueuedMemory } from "../../features/queue";
import { colors } from "../../lib/theme/tokens";
import { TimelineSpineLine } from "./timeline-spine-line";
import { TimelineTodayCap } from "./timeline-today-cap";
import { TimelineMonthMarker } from "./timeline-month-marker";
import { TimelineGhostRow } from "./timeline-ghost-row";
import { TimelineMemoryRow } from "./timeline-memory-row";
import { MemoryCard } from "../memory/memory-card";
import { MemoryGroupCard } from "../memory/memory-carousel";

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
  return (
    <ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.accent} />
      }
      contentContainerStyle={{ position: "relative", paddingLeft: 0, paddingRight: 16, paddingTop: 12, paddingBottom: 28 }}
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
