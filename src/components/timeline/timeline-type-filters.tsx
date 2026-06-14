import React from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FilterChip } from "../ui/filter-chip";
import { MemoryTypeFilter } from "../../features/memories/types";
import { memoryTypeColors } from "../../lib/theme/tokens";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Labels + icons mirror prototype TYPE_LABEL / TYPE_ICON (04-timeline.js:77-78).
// iconColor matches the year-view density-bar segment so the chips double as the
// color legend for that bar.
const FILTERS: { key: MemoryTypeFilter; label: string; icon?: IconName; iconColor?: string }[] = [
  { key: "all", label: "all" },
  { key: "photo", label: "photos", icon: "image", iconColor: memoryTypeColors.photo },
  { key: "video", label: "video", icon: "movie", iconColor: memoryTypeColors.video },
  { key: "letter", label: "letters", icon: "pencil", iconColor: memoryTypeColors.letter },
  { key: "ticket", label: "tickets", icon: "ticket-outline", iconColor: memoryTypeColors.ticket },
];

interface Props {
  active: MemoryTypeFilter;
  onChange: (filter: MemoryTypeFilter) => void;
}

export function TimelineTypeFilters({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        gap: 7,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 4,
        alignItems: "center",
      }}
    >
      {FILTERS.map((f) => (
        <FilterChip
          key={f.key}
          label={f.label}
          icon={f.icon}
          iconColor={f.iconColor}
          active={active === f.key}
          onPress={() => onChange(f.key)}
        />
      ))}
    </ScrollView>
  );
}
