import React from "react";
import { View, Text, Image } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import { useThumbnailUrl } from "../../features/media";
import { getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";

interface Props {
  memory: MemoryWithAuthor;
  index: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const VideoMemoryCard = React.memo(function VideoMemoryCard({ memory }: Props) {
  const { data: posterUrl } = useThumbnailUrl(memory);

  // Shared play glyph + duration badge (used in both branches)
  const playOverlay = (
    <View
      className="absolute inset-0 items-center justify-center"
      pointerEvents="none"
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{ backgroundColor: "rgba(12, 8, 6, 0.55)" }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderTopWidth: 8,
            borderBottomWidth: 8,
            borderLeftWidth: 14,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "#ffffff",
            marginLeft: 3,
          }}
        />
      </View>
    </View>
  );

  const durationBadge = memory.duration_seconds != null ? (
    <View
      className="absolute bottom-1.5 right-1.5 rounded-md px-1.5 py-0.5"
      style={{ backgroundColor: "rgba(12, 8, 6, 0.60)" }}
      pointerEvents="none"
    >
      <Text className="text-white font-semibold" style={{ fontSize: 10.5 }}>
        {formatDuration(memory.duration_seconds)}
      </Text>
    </View>
  ) : null;

  if (mono) {
    return (
      <View className="overflow-hidden">
        <View className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: 4 / 3 }}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel={memory.title ?? "Video memory"}
            />
          ) : (
            <View className="w-full h-full bg-shade items-center justify-center" />
          )}
          {playOverlay}
          {durationBadge}
        </View>

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
        <View className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: 4 / 3 }}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel={memory.title ?? "Video memory"}
            />
          ) : (
            <View className="w-full h-full bg-shade items-center justify-center" />
          )}
          {playOverlay}
          {durationBadge}
        </View>
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
