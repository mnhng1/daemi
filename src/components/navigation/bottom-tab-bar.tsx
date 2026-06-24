import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";

// Glass bottom bar: a frosted BlurView backdrop with a hairline top edge, four
// icon-only tabs and a raised accent "+" FAB in the dead centre. Labels were
// dropped for a Threads-style minimal look — active state reads as a filled icon.
const BAR_HEIGHT = 58;

type TabMeta = {
  // Outline glyph when inactive, filled glyph when the tab is focused.
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
};

const TAB_META: Record<string, TabMeta> = {
  timeline: { icon: "clock-outline", iconActive: "clock", label: "Timeline" },
  collections: { icon: "folder-outline", iconActive: "folder", label: "Collections" },
  places: { icon: "map-marker-outline", iconActive: "map-marker", label: "Places" },
  settings: { icon: "account-outline", iconActive: "account", label: "You" },
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
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}>
      {/* The floating pill: a rounded glass island detached from the screen edges.
          The blur + wash are clipped to the rounded shape here (overflow hidden);
          the raised FAB lives in the row OUTSIDE this clip so it can poke above. */}
      <View style={styles.pill} pointerEvents="none">
        <BlurView
          intensity={mono ? 50 : 44}
          tint={mono ? "light" : "default"}
          style={StyleSheet.absoluteFill}
        />
        {/* Very light wash — just enough to keep icons legible; the frosted blur
            material does most of the work so it reads as real glass. */}
        <View style={[StyleSheet.absoluteFill, styles.glassTint]} />
        {/* Top sheen: a soft light highlight along the upper edge, like light
            catching the rim of a glass surface. */}
        <View style={styles.sheen} />
      </View>
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
          const tint = focused ? colors.ink : colors.ink3;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.cell}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
            >
              <MaterialCommunityIcons
                name={focused ? meta.iconActive : meta.icon}
                size={26}
                color={tint}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // A FLOATING island: detached from all three edges (the `bottom` offset is
    // applied inline from the safe-area inset). Content scrolls under it; screens
    // reserve matching space via useTabBarSpace(). overflow visible lets the
    // raised FAB poke above the pill's rounded top. A translucent background (not
    // fully transparent) is what lets the rounded drop shadow actually render.
    position: "absolute",
    left: 16,
    right: 16,
    paddingHorizontal: 10,
    borderRadius: 30,
    // Light translucent base — kept low so the frosted blur shows through and the
    // island reads as glass rather than a flat panel (still opaque enough to cast
    // the rounded shadow below).
    backgroundColor: mono ? "rgba(255,255,255,0.30)" : "rgba(250,246,239,0.32)",
    overflow: "visible",
    // Soft drop shadow so the island reads as floating above the content.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  pill: {
    // Clips the frosted blur + wash to the rounded island shape and draws a light
    // glass rim. Sits over the container's translucent base.
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    // A light rim (not the dark hairline) reads as the edge of a glass surface.
    borderColor: mono ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.45)",
  },
  glassTint: {
    // Barely-there wash for icon legibility — the blur material carries the look.
    backgroundColor: mono ? "rgba(255,255,255,0.12)" : "rgba(250,246,239,0.14)",
  },
  sheen: {
    // A bright thin highlight hugging the top rim — light catching the glass edge.
    // Inset slightly from the corners so it follows the rounded top.
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
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
