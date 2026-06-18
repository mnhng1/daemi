import { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { withTiming, useReducedMotion, runOnJS } from "react-native-reanimated";
import { useCurrentCoupleSpace, useDayCount } from "../../../src/features/couple-space";
import { useMemoriesWithQueue, buildDayRows } from "../../../src/features/memories";
import { MemoryTypeFilter, isQueuedMemory } from "../../../src/features/memories/types";
import type { MemoryWithAuthor } from "../../../src/types/database";
import { useAnniversaryMonth } from "../../../src/features/collections";
import { TimelineHeader } from "../../../src/components/timeline/timeline-header";
import { TimelineFilterPopover } from "../../../src/components/timeline/timeline-filter-popover";
import { TimelineDayView } from "../../../src/components/timeline/timeline-day-view";
import { TimelineEmpty } from "../../../src/components/timeline/timeline-empty";
import { TimelineLoading } from "../../../src/components/timeline/timeline-loading";
import { TimelineError } from "../../../src/components/timeline/timeline-error";
import { OfflineBanner } from "../../../src/components/system/offline-banner";
import { ZoomLevel } from "../../../src/components/timeline/timeline-zoom-bar";
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

// Detail rank: year (coarse) < month < day (fine). Higher rank = more zoomed in.
const ZOOM_RANK: Record<ZoomLevel, number> = { year: 0, month: 1, day: 2 };

// Custom directional entering animations (Reanimated custom-animation API):
// zooming toward more detail grows the new view into place; toward less detail
// it shrinks into place — reading as a camera moving closer / further away.
function enterZoomIn() {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.88 }] },
    animations: {
      opacity: withTiming(1, { duration: 180 }),
      transform: [{ scale: withTiming(1, { duration: 220 }) }],
    },
  };
}

function enterZoomOut() {
  "worklet";
  return {
    initialValues: { opacity: 0, transform: [{ scale: 1.12 }] },
    animations: {
      opacity: withTiming(1, { duration: 180 }),
      transform: [{ scale: withTiming(1, { duration: 220 }) }],
    },
  };
}

export default function Timeline() {
  const [typeFilter, setTypeFilter] = useState<MemoryTypeFilter>("all");
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const [scrolled, setScrolled] = useState(false);
  // Type filters live in a popover anchored to the header filter button rather
  // than an always-on row, to save vertical space.
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  // Direction of the last zoom change — picks the entering animation. Set inside
  // the state updater so it's correct for the same render that re-keys the view.
  const dirRef = useRef<"in" | "out">("in");
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

  // Single entry point for zoom changes: records direction (for the entering
  // animation) before committing the new level. Functional updater avoids a
  // stale closure on `zoom`.
  const changeZoom = useCallback((next: ZoomLevel) => {
    setZoom((cur) => {
      if (next === cur) return cur;
      dirRef.current = ZOOM_RANK[next] > ZOOM_RANK[cur] ? "in" : "out";
      return next;
    });
  }, []);

  // Pinch gesture: derive the next level from the current one, then route through
  // changeZoom so direction tracking lives in one place.
  const applyPinch = useCallback(
    (scale: number) => {
      setZoom((z) => {
        const next =
          scale > 1.15 ? stepZoom(z, "in") : scale < 0.85 ? stepZoom(z, "out") : z;
        if (next === z) return z;
        dirRef.current = ZOOM_RANK[next] > ZOOM_RANK[z] ? "in" : "out";
        return next;
      });
    },
    []
  );

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
      <TimelineHeader
        scrolled={scrolled}
        onJumpTop={jumpTop}
        dayCount={dayCount}
        filtersActive={filterMenuOpen || typeFilter !== "all"}
        onToggleFilters={() => setFilterMenuOpen((o) => !o)}
      />
      <TimelineFilterPopover
        visible={filterMenuOpen}
        onClose={() => setFilterMenuOpen(false)}
        active={typeFilter}
        onChange={setTypeFilter}
      />
      <OfflineBanner spaceId={spaceId} />
      <GestureDetector gesture={pinch}>
        <Animated.View
          key={zoom}
          entering={
            reduceMotion ? undefined : dirRef.current === "in" ? enterZoomIn : enterZoomOut
          }
          style={{ flex: 1 }}
        >
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
                onZoomMonth={() => changeZoom("month")}
              />
            )
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
