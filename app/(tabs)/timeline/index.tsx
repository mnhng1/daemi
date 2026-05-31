import { useState, useMemo, useCallback } from "react";
import { View, SectionList, RefreshControl } from "react-native";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useMemories, groupMemoriesByDate } from "../../../src/features/memories";
import { MemoryTypeFilter } from "../../../src/features/memories/types";
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
  const sections = useMemo(() => groupMemoriesByDate(memories ?? []), [memories]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <TimelineDateHeader title={section.title} />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item, index, section }: { item: any; index: number; section: { data: any[] } }) => (
      <TimelineRow
        memory={item}
        index={index}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
      />
    ),
    []
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
