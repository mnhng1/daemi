import { useState, useMemo, useCallback } from "react";
import { View, SectionList, RefreshControl } from "react-native";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useMemories, groupMemoriesByDate, isMemoryGroup } from "../../../src/features/memories";
import { MemoryTypeFilter, TimelineItem, MemoryGroup } from "../../../src/features/memories/types";
import { TimelineHeader } from "../../../src/components/timeline/timeline-header";
import { TimelineTypeFilters } from "../../../src/components/timeline/timeline-type-filters";
import { TimelineDateHeader } from "../../../src/components/timeline/timeline-date-header";
import { TimelineRow } from "../../../src/components/timeline/timeline-row";
import { TimelineEmpty } from "../../../src/components/timeline/timeline-empty";
import { TimelineLoading } from "../../../src/components/timeline/timeline-loading";
import { TimelineError } from "../../../src/components/timeline/timeline-error";
import { colors } from "../../../src/lib/theme/tokens";

export default function Timeline() {
  const [typeFilter, setTypeFilter] = useState<MemoryTypeFilter>("all");
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces.id;
  const { data: memories, isLoading, isError, refetch } = useMemories(spaceId, typeFilter);

  const sections = useMemo(() => {
    const raw = groupMemoriesByDate(memories ?? []);
    return raw.map((section) => {
      if (section.data.length <= 1) {
        return section as { title: string; dateKey: string; data: TimelineItem[] };
      }
      const group: MemoryGroup = { _group: true, memories: section.data, id: section.dateKey };
      return { title: section.title, dateKey: section.dateKey, data: [group] as TimelineItem[] };
    });
  }, [memories]);

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

  const renderContent = () => {
    if (isLoading) return <TimelineLoading />;
    if (isError) return <TimelineError onRetry={refetch} />;
    if (sections.length === 0) return <TimelineEmpty />;
    return null;
  };

  return (
    <View className="flex-1 bg-paper">
      <TimelineHeader />
      <TimelineTypeFilters active={typeFilter} onChange={setTypeFilter} />
      {renderContent() ?? (
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
      )}
    </View>
  );
}
