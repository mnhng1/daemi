import { useState, useMemo, useCallback } from "react";
import { View, SectionList, RefreshControl } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, useReducedMotion, runOnJS } from "react-native-reanimated";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useMemoriesWithQueue, groupMemoriesByDate, isMemoryGroup } from "../../../src/features/memories";
import { MemoryTypeFilter, TimelineItem, MemoryGroup, isQueuedMemory } from "../../../src/features/memories/types";
import type { MemoryWithAuthor } from "../../../src/types/database";
import { useAnniversaryMonth } from "../../../src/features/collections";
import { TimelineHeader } from "../../../src/components/timeline/timeline-header";
import { TimelineTypeFilters } from "../../../src/components/timeline/timeline-type-filters";
import { TimelineDateHeader } from "../../../src/components/timeline/timeline-date-header";
import { TimelineRow } from "../../../src/components/timeline/timeline-row";
import { TimelineEmpty } from "../../../src/components/timeline/timeline-empty";
import { TimelineLoading } from "../../../src/components/timeline/timeline-loading";
import { TimelineError } from "../../../src/components/timeline/timeline-error";
import { OfflineBanner } from "../../../src/components/system/offline-banner";
import { TimelineZoomBar, ZoomLevel } from "../../../src/components/timeline/timeline-zoom-bar";
import { TimelineMonthView } from "../../../src/components/timeline/timeline-month-view";
import { TimelineYearView } from "../../../src/components/timeline/timeline-year-view";
import { colors } from "../../../src/lib/theme/tokens";

function stepZoom(z: ZoomLevel, dir: "in" | "out"): ZoomLevel {
  if (dir === "in") {
    if (z === "year") return "month";
    if (z === "month") return "day";
    return "day"; // already at day, clamp
  } else {
    if (z === "day") return "month";
    if (z === "month") return "year";
    return "year"; // already at year, clamp
  }
}

export default function Timeline() {
  const [typeFilter, setTypeFilter] = useState<MemoryTypeFilter>("all");
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces.id;
  const reduceMotion = useReducedMotion();
  const anniversaryMonth = useAnniversaryMonth(spaceId);

  // Type filter applies only in day view; month/year always aggregate all types.
  const effectiveFilter = zoom === "day" ? typeFilter : "all";
  const { data: memories, isLoading, isError, refetch } = useMemoriesWithQueue(spaceId, effectiveFilter);

  // Split into queued and remote up-front so month/year can use remote directly.
  const { queued, remote } = useMemo(() => {
    const all = memories ?? [];
    return {
      queued: all.filter(isQueuedMemory),
      remote: all.filter((m): m is MemoryWithAuthor => !isQueuedMemory(m)),
    };
  }, [memories]);

  // Day-view sections built from the queued/remote split above.
  const sections = useMemo(() => {
    const remoteSections = groupMemoriesByDate(remote).map((section) => {
      if (section.data.length <= 1) {
        return section as { title: string; dateKey: string; data: TimelineItem[] };
      }
      const group: MemoryGroup = { _group: true, memories: section.data, id: section.dateKey };
      return { title: section.title, dateKey: section.dateKey, data: [group] as TimelineItem[] };
    });
    if (queued.length === 0) return remoteSections;
    return [
      { title: "Uploading", dateKey: "__queued__", data: queued as TimelineItem[] },
      ...remoteSections,
    ];
  }, [queued, remote]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => {
      const sectionIdx = sections.findIndex((s) => s.title === section.title);
      return <TimelineDateHeader title={section.title} isFirst={sectionIdx === 0} />;
    },
    [sections]
  );

  const renderItem = useCallback(
    ({ item, index, section }: { item: TimelineItem; index: number; section: { data: TimelineItem[] } }) => {
      const sectionIdx = sections.findIndex((s) => s.title === (section as any).title);
      const isFirstGlobal = sectionIdx === 0 && index === 0;
      const isLastGlobal = sectionIdx === sections.length - 1 && index === section.data.length - 1;
      return (
        <TimelineRow
          item={item}
          index={index}
          isFirst={isFirstGlobal}
          isLast={isLastGlobal}
        />
      );
    },
    [sections]
  );

  // Pinch gesture: uses functional setState updater to avoid stale closure on zoom.
  const applyPinch = useCallback((scale: number) => {
    setZoom((z) => {
      if (scale > 1.15) return stepZoom(z, "in");
      if (scale < 0.85) return stepZoom(z, "out");
      return z;
    });
  }, []);

  const pinch = Gesture.Pinch().onEnd((e) => {
    "worklet";
    runOnJS(applyPinch)(e.scale);
  });

  const renderDayContent = () => {
    if (isLoading) return <TimelineLoading />;
    if (isError) return <TimelineError onRetry={refetch} />;
    if (sections.length === 0) return <TimelineEmpty />;
    return null;
  };

  const renderAggregateContent = () => {
    if (isLoading) return <TimelineLoading />;
    if (isError) return <TimelineError onRetry={refetch} />;
    if (remote.length === 0) return <TimelineEmpty />;
    return null;
  };

  return (
    <View className="flex-1 bg-paper">
      <TimelineHeader />
      <TimelineTypeFilters active={typeFilter} onChange={setTypeFilter} />
      <OfflineBanner spaceId={spaceId} />
      <TimelineZoomBar zoom={zoom} onChange={setZoom} />
      <GestureDetector gesture={pinch}>
        <Animated.View key={zoom} entering={reduceMotion ? undefined : FadeIn.duration(180)} style={{ flex: 1 }}>
          {zoom === "day" && (
            renderDayContent() ?? (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderSectionHeader={renderSectionHeader}
                renderItem={renderItem}
                stickySectionHeadersEnabled={false}
                windowSize={5}
                maxToRenderPerBatch={10}
                refreshControl={
                  <RefreshControl
                    refreshing={false}
                    onRefresh={refetch}
                    tintColor={colors.accent}
                  />
                }
                contentContainerStyle={{ paddingBottom: 32 }}
              />
            )
          )}
          {zoom === "month" && (
            renderAggregateContent() ?? (
              <TimelineMonthView memories={remote} anniversaryMonth={anniversaryMonth} />
            )
          )}
          {zoom === "year" && (
            renderAggregateContent() ?? (
              <TimelineYearView
                memories={remote}
                anniversaryMonth={anniversaryMonth}
                onZoomMonth={() => setZoom("month")}
              />
            )
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
