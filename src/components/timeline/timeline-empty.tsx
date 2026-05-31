import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export function TimelineEmpty() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-[44px] items-center mb-4">
        <View className="w-[2px] h-8 bg-ink-4" />
        <View className="w-[13px] h-[13px] rounded-full border-2 border-ink-3 bg-paper" />
        <View className="w-[2px] h-8 bg-ink-4" />
      </View>
      <Text className="text-ink text-lg font-semibold text-center mb-2">
        Your story starts here
      </Text>
      <Text className="text-ink-3 text-sm text-center mb-6">
        Add your first memory to begin your shared timeline
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add first memory"
        className="min-h-[44px] bg-accent rounded-full px-6 items-center justify-center"
        onPress={() => router.push("/(tabs)/add")}
      >
        <Text className="text-white font-semibold text-sm">Add Memory</Text>
      </Pressable>
    </View>
  );
}
