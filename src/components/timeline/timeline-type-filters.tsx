import { View } from "react-native";
import { FilterChip } from "../ui/filter-chip";
import { MemoryTypeFilter } from "../../features/memories/types";

const FILTERS: { key: MemoryTypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photo", label: "Photos" },
  { key: "letter", label: "Letters" },
];

interface Props {
  active: MemoryTypeFilter;
  onChange: (filter: MemoryTypeFilter) => void;
}

export function TimelineTypeFilters({ active, onChange }: Props) {
  return (
    <View className="flex-row gap-2 px-4 pb-3">
      {FILTERS.map((f) => (
        <FilterChip
          key={f.key}
          label={f.label}
          active={active === f.key}
          onPress={() => onChange(f.key)}
        />
      ))}
    </View>
  );
}
