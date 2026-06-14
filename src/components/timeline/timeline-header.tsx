import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, fonts } from "../../lib/theme/tokens";
import { IconButton } from "../ui/icon-button";

interface Props {
  scrolled: boolean;
  onJumpTop: () => void;
  dayCount: number | null;
}

// Prototype AppHeader (02-ui-primitives.js:140-155, usage 04-timeline.js:328-333):
// centered title + day-count subtitle, left heart→places (swaps to scroll-to-top
// when scrolled), right search.
export function TimelineHeader({ scrolled, onJumpTop, dayCount }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: insets.top + 6,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <View style={{ minWidth: 34, alignItems: "flex-start" }}>
        {scrolled ? (
          <IconButton icon="chevron-up" active onPress={onJumpTop} accessibilityLabel="Scroll to top" />
        ) : (
          <IconButton
            icon="heart-outline"
            onPress={() => router.push("/(tabs)/places")}
            accessibilityLabel="Open places"
          />
        )}
      </View>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: "700", color: colors.ink, lineHeight: 30 }}>
          daemi
        </Text>
        {dayCount != null && (
          <Text style={{ fontFamily: fonts.ui, fontSize: 11, color: colors.ink3, marginTop: 1 }}>
            {`day ${dayCount}`}
          </Text>
        )}
      </View>

      <View style={{ minWidth: 34, alignItems: "flex-end" }}>
        <IconButton
          icon="magnify"
          onPress={() => router.push("/(tabs)/search")}
          accessibilityLabel="Search"
        />
      </View>
    </View>
  );
}
