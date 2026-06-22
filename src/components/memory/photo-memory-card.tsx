import React from "react";
import { View, Text, Image } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";

interface Props {
  memory: MemoryWithAuthor;
  index: number;
}

export const PhotoMemoryCard = React.memo(function PhotoMemoryCard({ memory, index }: Props) {
  const { data: mediaUrl } = useMediaUrl(memory);

  if (mono) {
    return (
      <View className="overflow-hidden">
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            className="w-full rounded-xl"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
            accessibilityLabel={memory.title ?? "Photo memory"}
          />
        ) : (
          <View
            className="w-full rounded-xl bg-shade items-center justify-center"
            style={{ aspectRatio: 4 / 3 }}
          />
        )}

        <View className="pt-2 pb-1">
          {memory.title && (
            <Text
              className="text-ink font-semibold"
              style={{ fontSize: 15 }}
              numberOfLines={1}
            >
              {memory.title}
            </Text>
          )}
          <View className="flex-row items-center justify-between mt-1">
            {memory.place_name ? (
              <View className="flex-row items-center bg-shade rounded-full px-2.5 py-1">
                <View className="w-1.5 h-1.5 rounded-full bg-ink-3 mr-1.5" />
                <Text className="text-ink-3 text-xs">{memory.place_name}</Text>
              </View>
            ) : (
              <View />
            )}
            {memory.reactions.length > 0 && (
              <Text style={{ fontSize: 12 }}>❤️</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-surface rounded-2xl border border-ink-4/20 shadow-sm overflow-hidden">
      <View className="p-2">
        {mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            className="w-full rounded-xl"
            style={{ aspectRatio: 4 / 3 }}
            resizeMode="cover"
            accessibilityLabel={memory.title ?? "Photo memory"}
          />
        ) : (
          <View
            className="w-full rounded-xl bg-shade items-center justify-center"
            style={{ aspectRatio: 4 / 3 }}
          />
        )}
      </View>

      <View className="px-3 pb-3 pt-1">
        {memory.title && (
          <Text className="text-ink text-base font-semibold leading-snug" numberOfLines={1}>
            {memory.title}
          </Text>
        )}
        <View className="flex-row items-center justify-between mt-1.5">
          {memory.place_name ? (
            <View className="flex-row items-center bg-surface-2 rounded-full px-2.5 py-1">
              <View className="w-1.5 h-1.5 rounded-full bg-ink-3 mr-1.5" />
              <Text className="text-ink-3 text-xs">{memory.place_name}</Text>
            </View>
          ) : (
            <View />
          )}
          <View className="flex-row items-center gap-1.5">
            {memory.reactions.length > 0 && (
              <Text style={{ fontSize: 12 }}>❤️</Text>
            )}
            <View className="w-6 h-6 rounded-full bg-shade border border-ink-4/30" />
          </View>
        </View>
      </View>
    </View>
  );
});
