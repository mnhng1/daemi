import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import {
  monthTypeCounts,
  monthTripMarker,
  scaffoldMonths,
  MonthScaffoldRow,
} from "../../features/memories";
import { MemoryTypeFilter } from "../../features/memories/types";
import { colors, fonts, memoryTypeColors, getAppearance } from "../../lib/theme/tokens";
import { TimelineNode } from "./timeline-node";
import { TimelineSpineLine } from "./timeline-spine-line";
import { MonoGallery, type GallerySection } from "./timeline-gallery";

interface Props {
  memories: MemoryWithAuthor[];
  anniversaryMonth: number | null;
  typeFilter: MemoryTypeFilter;
  onZoomMonth: () => void;
}

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

export function TimelineYearView({ memories, anniversaryMonth, typeFilter, onZoomMonth }: Props) {
  const rows = useMemo<YearRow[]>(() => {
    const scaffold = scaffoldMonths(memories, new Date());
    return scaffold.map((row, i) => ({
      ...row,
      showYear: i === 0 || scaffold[i - 1].year !== row.year,
    }));
  }, [memories]);

  // The metric driving each bar's length: total memories ("all") or the count of
  // the selected type. Busiest month sets the full-length reference.
  const maxMetric = useMemo(() => {
    const metric = (items: MemoryWithAuthor[]) =>
      typeFilter === "all" ? items.length : items.filter((m) => m.type === typeFilter).length;
    return Math.max(1, ...rows.map((r) => metric(r.items)));
  }, [rows, typeFilter]);

  // Monochrome: a flat photo-grid gallery grouped by year, in place of the
  // scrapbook spine / volume-bar layout.
  const mono = getAppearance() === "monochrome";
  const gallerySections = useMemo<GallerySection[]>(() => {
    if (!mono) return [];
    const filtered =
      typeFilter === "all" ? memories : memories.filter((m) => m.type === typeFilter);
    const byYear = new Map<number, MemoryWithAuthor[]>();
    for (const m of filtered) {
      const y = new Date(m.date_happened + "T00:00:00").getFullYear();
      const bucket = byYear.get(y);
      if (bucket) bucket.push(m);
      else byYear.set(y, [m]);
    }
    return Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, items]) => ({
        key: String(year),
        label: String(year),
        sub: `${items.length} ${items.length === 1 ? "memory" : "memories"}`,
        items,
      }));
  }, [mono, memories, typeFilter]);

  if (mono) return <MonoGallery sections={gallerySections} />;

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
        // For "all", the metric is total memories; for a type, that type's count.
        const metric = typeFilter === "all" ? counts.total : counts[typeFilter];
        const hasContent = metric > 0;

        const marker = hasContent
          ? monthTripMarker(item.items, anniversaryMonth, item.month)
          : null;
        const dateColor = item.isCurrentMonth
          ? colors.accent
          : hasContent
            ? colors.ink
            : colors.ink3;
        const fillPct = hasContent ? Math.max(metric / maxMetric, MIN_BAR_FRACTION) * 100 : 0;

        const caption = !hasContent
          ? "—"
          : typeFilter === "all"
            ? `${counts.total} ${counts.total === 1 ? "memory" : "memories"}`
            : `${metric} ${typeFilter}${metric === 1 ? "" : "s"}`;

        return (
          // Months with nothing for the current filter are non-interactive placeholders.
          <Pressable
            key={item.monthKey}
            disabled={!hasContent}
            onPress={hasContent ? onZoomMonth : undefined}
            accessibilityRole={hasContent ? "button" : "none"}
            accessibilityLabel={
              hasContent
                ? `${MON[item.month]} ${item.year}, ${caption}. Tap to zoom in.`
                : `${MON[item.month]} ${item.year}, ${caption}`
            }
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginVertical: 6,
              opacity: hasContent ? 1 : 0.55,
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
              <TimelineNode filled={hasContent} accent={item.isCurrentMonth} sm />
            </View>

            {/* Gap */}
            <View style={{ width: 12, flexShrink: 0 }} />

            {/* Right content: volume bar + caption */}
            <View style={{ flex: 1, minWidth: 0 }}>
              {!hasContent ? (
                /* Faint placeholder track for a month with nothing for this filter */
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
                   memories (vs the busiest month). For "all" the fill's SEGMENTS
                   show the type mix; for a single type it's that type's color. */
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
                    {typeFilter === "all" ? (
                      TYPES.map((type) =>
                        counts[type] > 0 ? (
                          <View
                            key={type}
                            style={{ flex: counts[type], backgroundColor: memoryTypeColors[type] }}
                          />
                        ) : null
                      )
                    ) : (
                      <View style={{ flex: 1, backgroundColor: memoryTypeColors[typeFilter] }} />
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
                  {caption}
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
