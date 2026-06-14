import React from "react";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../lib/theme/tokens";

interface Props {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
  active?: boolean;
  accessibilityLabel: string;
}

// Prototype HeaderBtn (02-ui-primitives.js:157-172): 34×34 rounded square,
// line border, surface bg (accent when active), subtle shadow.
export function IconButton({ icon, onPress, active = false, accessibilityLabel }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      // Static style: css-interop's wrapped Pressable ignores the function form.
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: active ? colors.accent : colors.surface,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <MaterialCommunityIcons name={icon} size={18} color={active ? "#fff" : colors.ink} />
    </Pressable>
  );
}
