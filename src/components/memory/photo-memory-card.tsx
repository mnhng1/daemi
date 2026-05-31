import React from "react";
import { View, Text, Image } from "react-native";
import { Memory } from "../../types/database";

interface Props {
  memory: Memory;
  index: number;
}

export const PhotoMemoryCard = React.memo(function PhotoMemoryCard({ memory, index }: Props) {
  const rotation = index % 2 === 0 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]";

  return (
    <View className={`bg-surface rounded-2xl border border-ink-4/20 shadow-sm overflow-hidden ${rotation}`}>
      {memory.media_url && (
        <Image
          source={{ uri: memory.media_url }}
          className="w-full aspect-[4/3] rounded-xl"
          resizeMode="cover"
          accessibilityLabel={memory.title ?? "Photo memory"}
        />
      )}
      {memory.title && (
        <View className="p-3">
          <Text className="text-ink text-base font-semibold leading-snug">
            {memory.title}
          </Text>
          {memory.place_name && (
            <Text className="text-ink-3 text-xs mt-1">{memory.place_name}</Text>
          )}
        </View>
      )}
    </View>
  );
});
