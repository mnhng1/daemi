import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";

// Mirrors the prototype BottomNav (docs/prototype/src/02-ui-primitives.js):
// four labelled tabs with a raised accent "+" FAB in the dead centre.
const BAR_HEIGHT = 60;

type TabMeta = { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap };

const TAB_META: Record<string, TabMeta> = {
  timeline: { label: "timeline", icon: "clock-outline" },
  collections: { label: "collections", icon: "folder-outline" },
  places: { label: "places", icon: "map-marker-outline" },
  settings: { label: "you", icon: "account-outline" },
  // `search` is intentionally absent: it's hidden from the bar (href: null in the
  // tabs layout). Any lingering search route renders nothing via the !meta guard.
};

// Structural subset of @react-navigation BottomTabBarProps — only what we read.
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: "tabPress"; target?: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
}

export function BottomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          // Route names are the folder path, e.g. "timeline/index" — key off the first segment.
          const key = route.name.split("/")[0];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (key === "add") {
            return (
              <View key={route.key} style={styles.cell}>
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel="Add a memory"
                  style={
                    mono
                      ? [
                          styles.fab,
                          {
                            shadowColor: "transparent",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0,
                            shadowRadius: 0,
                            elevation: 0,
                          },
                        ]
                      : styles.fab
                  }
                >
                  <MaterialCommunityIcons name="plus" size={26} color="#fff" />
                </Pressable>
              </View>
            );
          }

          const meta = TAB_META[key];
          if (!meta) return null;
          const tint = focused ? colors.accent : colors.ink3;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.cell}>
              <MaterialCommunityIcons name={meta.icon} size={22} color={tint} />
              <Text style={[styles.label, { color: tint }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: 12,
    // Let the raised FAB poke above the bar instead of being clipped.
    overflow: "visible",
  },
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    // Raised above the bar; the cell centres it horizontally.
    marginTop: -28,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
});
