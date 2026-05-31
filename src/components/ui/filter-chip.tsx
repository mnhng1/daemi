import { Pressable, Text } from "react-native";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      className={`min-h-[44px] px-4 items-center justify-center rounded-full ${
        active ? "bg-accent" : "bg-surface-2"
      }`}
    >
      <Text
        className={`text-[13px] font-medium ${
          active ? "text-white" : "text-ink-2"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
