import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../lib/theme/tokens";

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

// Small inline metadata pill — place, collection, etc. Ported from the prototype
// `MetaPill` (docs/prototype/src/02-ui-primitives.js:225). Renders as a Pressable
// when `onPress` is supplied, otherwise a static View.
export function MetaPill({ label, icon, accent, onPress, accessibilityLabel }: Props) {
  const fg = accent ? colors.accentText : colors.ink2;
  const iconColor = accent ? colors.accentText : colors.ink3;

  const content = (
    <>
      {icon && <Ionicons name={icon} size={12} color={iconColor} />}
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  const style = [
    styles.pill,
    accent ? styles.accent : styles.plain,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        style={style}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={style} accessibilityLabel={accessibilityLabel ?? label}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
    maxWidth: "100%",
  },
  plain: {
    backgroundColor: colors.surface2,
    borderColor: colors.line,
  },
  accent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 12,
    flexShrink: 1,
  },
});
