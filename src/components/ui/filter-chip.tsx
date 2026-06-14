import React from "react";
import { Pressable, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts } from "../../lib/theme/tokens";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}

// Prototype Chip (02-ui-primitives.js:210-223): compact pill, line border,
// surface→accent on active, optional leading icon. Visual height stays small;
// hitSlop keeps a ~44px touch target.
export function FilterChip({ label, active, onPress, icon }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.line,
        backgroundColor: active ? colors.accent : colors.surface,
      }}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={13}
          color={active ? "#fff" : colors.ink3}
        />
      )}
      <Text
        style={{
          fontFamily: fonts.ui,
          fontSize: 12.5,
          fontWeight: active ? "600" : "500",
          color: active ? "#fff" : colors.ink2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
