import { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, useReducedMotion, runOnJS } from "react-native-reanimated";
import { useCurrentCoupleSpace, useDayCount } from "../../../src/features/couple-space";
import { useMemoriesWithQueue, buildDayRows } from "../../../src/features/memories";
import { MemoryTypeFilter, isQueuedMemory } from "../../../src/features/memories/types";
import type { MemoryWithAuthor } from "../../../src/types/database";
import { useAnniversaryMonth } from "../../../src/features/collections";
import { TimelineHeader } from "../../../src/components/timeline/timeline-header";
import { TimelineTypeFilters } from "../../../src/components/timeline/timeline-type-filters";
import { TimelineDayView } from "../../../src/components/timeline/timeline-day-view";
import { TimelineEmpty } from "../../../src/components/timeline/timeline-empty";
import { TimelineLoading } from "../../../src/components/timeline/timeline-loading";
import { TimelineError } from "../../../src/components/timeline/timeline-error";
import { OfflineBanner } from "../../../src/components/system/offline-banner";
import { TimelineZoomBar, ZoomLevel } from "../../../src/components/timeline/timeline-zoom-bar";
import { TimelineMonthView } from "../../../src/components/timeline/timeline-month-view";
import { TimelineYearView } from "../../../src/components/timeline/timeline-year-view";

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
  const [scrolled, setScrolled] = useState(false);
  const dayScrollRef = useRef<ScrollView | null>(null);
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces.id;
  const reduceMotion = useReducedMotion();
  const anniversaryMonth = useAnniversaryMonth(spaceId);
  const dayCount = useDayCount(spaceId);

  // Day view needs the unfiltered list so ghost rows can show hidden counts; the
  // filter is applied inside buildDayRows. Month/year always aggregate all types.
  const { data: memories, isLoading, isError, refetch } = useMemoriesWithQueue(spaceId, "all");

  // Split into queued and remote up-front so month/year can use remote directly.
  const { queued, remote } = useMemo(() => {
    const all = memories ?? [];
    return {
      queued: all.filter(isQueuedMemory),
      remote: all.filter((m): m is MemoryWithAuthor => !isQueuedMemory(m)),
    };
  }, [memories]);

  const dayRows = useMemo(
    () => buildDayRows(remote, queued, anniversaryMonth, typeFilter),
    [remote, queued, anniversaryMonth, typeFilter]
  );

  const onDayScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const top = e.nativeEvent.contentOffset.y;
      setScrolled((prev) => (top > 320 !== prev ? top > 320 : prev));
    },
    []
  );

  const jumpTop = useCallback(() => {
    dayScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

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
    if (remote.length === 0 && queued.length === 0) return <TimelineEmpty />;
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
      <TimelineHeader scrolled={scrolled} onJumpTop={jumpTop} dayCount={dayCount} />
      <TimelineTypeFilters active={typeFilter} onChange={setTypeFilter} />
      <OfflineBanner spaceId={spaceId} />
      <TimelineZoomBar zoom={zoom} onChange={setZoom} />
      <GestureDetector gesture={pinch}>
        <Animated.View key={zoom} entering={reduceMotion ? undefined : FadeIn.duration(180)} style={{ flex: 1 }}>
          {zoom === "day" && (
            renderDayContent() ?? (
              <TimelineDayView
                rows={dayRows}
                onRefresh={refetch}
                scrollRef={dayScrollRef}
                onScroll={onDayScroll}
              />
            )
          )}
          {zoom === "month" && (
            renderAggregateContent() ?? (
              <TimelineMonthView
                memories={remote}
                anniversaryMonth={anniversaryMonth}
                typeFilter={typeFilter}
              />
            )
          )}
          {zoom === "year" && (
            renderAggregateContent() ?? (
              <TimelineYearView
                memories={remote}
                anniversaryMonth={anniversaryMonth}
                typeFilter={typeFilter}
                onZoomMonth={() => setZoom("month")}
              />
            )
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
