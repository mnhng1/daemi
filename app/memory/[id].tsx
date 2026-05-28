import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
export default function MemoryDetail() {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex-1 items-center justify-center bg-paper">
      <Text className="text-ink text-lg">Memory {id}</Text>
    </View>
  );
}
