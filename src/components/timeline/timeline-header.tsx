import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts } from "../../lib/theme/tokens";
import { IconButton } from "../ui/icon-button";

interface Props {
  scrolled: boolean;
  onJumpTop: () => void;
  dayCount: number | null;
  filtersActive: boolean;
  onToggleFilters: () => void;
}

// Title + day-count subtitle sit top-left; the right cluster holds the filter
// toggle (collapses the type-filter row) and search, plus a scroll-to-top
// chevron that appears once scrolled.
export function TimelineHeader({
  scrolled,
  onJumpTop,
  dayCount,
  filtersActive,
  onToggleFilters,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-start" }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: "700", color: colors.ink, lineHeight: 30 }}>
          daemi
        </Text>
        {dayCount != null && (
          <Text style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.ink3, marginTop: 1 }}>
            {`day ${dayCount}`}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {scrolled && (
          <IconButton icon="chevron-up" active onPress={onJumpTop} accessibilityLabel="Scroll to top" />
        )}
        <IconButton
          icon="filter-variant"
          active={filtersActive}
          onPress={onToggleFilters}
          accessibilityLabel="Filter memories"
        />
        <IconButton
          icon="magnify"
          onPress={() => router.push("/(tabs)/search")}
          accessibilityLabel="Search"
        />
      </View>
    </View>
  );
}
