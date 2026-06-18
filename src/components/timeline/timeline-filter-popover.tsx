import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MemoryTypeFilter } from "../../features/memories/types";
import { colors, fonts, memoryTypeColors, cardShadow } from "../../lib/theme/tokens";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

// Mirrors prototype TYPE_LABEL / TYPE_ICON (04-timeline.js:77-78). iconColor
// matches the year-view density-bar segment so the menu doubles as the legend.
const FILTERS: { key: MemoryTypeFilter; label: string; icon?: IconName; iconColor?: string }[] = [
  { key: "all", label: "All" },
  { key: "photo", label: "Photos", icon: "image", iconColor: memoryTypeColors.photo },
  { key: "video", label: "Video", icon: "movie", iconColor: memoryTypeColors.video },
  { key: "letter", label: "Letters", icon: "pencil", iconColor: memoryTypeColors.letter },
  { key: "ticket", label: "Tickets", icon: "ticket-outline", iconColor: memoryTypeColors.ticket },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  active: MemoryTypeFilter;
  onChange: (filter: MemoryTypeFilter) => void;
}

// Filter menu anchored to the header's filter button: a small card in the
// top-right that lists the type filters vertically. Tapping the dimmed backdrop
// (or a row) dismisses it.
export function TimelineFilterPopover({ visible, onClose, active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Empty onPress absorbs taps so they don't fall through to the backdrop. */}
        <Pressable style={[styles.card, { top: insets.top + 50 }]} onPress={() => {}}>
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  onChange(f.key);
                  onClose();
                }}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isActive }}
                style={[styles.row, isActive && styles.rowActive]}
              >
                <View style={styles.iconCol}>
                  {f.icon && (
                    <MaterialCommunityIcons
                      name={f.icon}
                      size={16}
                      color={isActive ? colors.accent : f.iconColor ?? colors.ink3}
                    />
                  )}
                </View>
                <Text style={[styles.label, isActive && styles.labelActive]}>{f.label}</Text>
                {isActive && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20,16,12,0.18)",
  },
  card: {
    position: "absolute",
    right: 12,
    minWidth: 176,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 6,
    ...cardShadow,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    marginHorizontal: 4,
  },
  rowActive: {
    backgroundColor: colors.accentSoft,
  },
  iconCol: {
    width: 18,
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: colors.ink2,
  },
  labelActive: {
    color: colors.accentText,
    fontWeight: "700",
  },
  check: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.accent,
  },
});
