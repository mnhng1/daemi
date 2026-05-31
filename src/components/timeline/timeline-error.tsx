import { View, Text, Pressable } from "react-native";

interface Props {
  onRetry: () => void;
}

export function TimelineError({ onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-ink text-lg font-semibold text-center mb-2">
        Something went wrong
      </Text>
      <Text className="text-ink-3 text-sm text-center mb-6">
        We couldn't load your memories
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading memories"
        className="min-h-[44px] bg-accent rounded-full px-6 items-center justify-center"
      >
        <Text className="text-white font-semibold text-sm">Try Again</Text>
      </Pressable>
    </View>
  );
}
