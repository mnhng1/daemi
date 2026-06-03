import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../lib/theme/tokens";
import { toDateKey } from "../../lib/utils/date";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const MAX_GRID = 4;

function GridThumbnail({ memory }: { memory: MemoryWithAuthor }) {
  const { data: mediaUrl } = useMediaUrl(memory);
  if (memory.type === "letter") {
    return (
      <View className="flex-1 rounded-lg overflow-hidden items-center justify-center" style={{ aspectRatio: 1, backgroundColor: colors.letterPaper }}>
        <Text className="text-accent text-xs font-semibold uppercase">Letter</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 rounded-lg overflow-hidden" style={{ aspectRatio: 1 }}>
      {mediaUrl ? (
        <Image
          source={{ uri: mediaUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-shade" />
      )}
    </View>
  );
}

function OverflowThumbnail({ memory, count }: { memory: MemoryWithAuthor; count: number }) {
  const { data: mediaUrl } = useMediaUrl(memory);
  if (memory.type === "letter") {
    return (
      <View className="flex-1 rounded-lg overflow-hidden items-center justify-center" style={{ aspectRatio: 1, backgroundColor: colors.letterPaper }}>
        <Text className="text-accent text-xs font-semibold uppercase">Letter</Text>
        <View
          className="rounded-lg items-center justify-center"
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(42, 37, 32, 0.45)" }]}
        >
          <Text className="text-white text-lg font-semibold">+{count}</Text>
        </View>
      </View>
    );
  }
  return (
    <View className="flex-1 rounded-lg overflow-hidden" style={{ aspectRatio: 1 }}>
      {mediaUrl ? (
        <Image source={{ uri: mediaUrl }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="w-full h-full bg-shade" />
      )}
      <View
        className="rounded-lg items-center justify-center"
        style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(42, 37, 32, 0.45)" }]}
      >
        <Text className="text-white text-lg font-semibold">+{count}</Text>
      </View>
    </View>
  );
}

interface Props {
  memories: MemoryWithAuthor[];
}

export const MemoryGroupCard = React.memo(function MemoryGroupCard({ memories }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (reduceMotion) return;
    scale.value = withTiming(0.97, { duration: 150, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0.9, { duration: 150, easing: Easing.out(Easing.ease) });
  };

  const handlePressOut = () => {
    if (reduceMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const visible = memories.slice(0, MAX_GRID);
  const overflow = Math.max(0, memories.length - MAX_GRID);
  const topRow = visible.slice(0, 2);
  const bottomRow = visible.slice(2, 4);
  const title = memories[0]?.title;
  const placeName = memories.find((m) => m.place_name)?.place_name;

  return (
    <AnimatedPressable
      onPress={() => router.push(`/album/${toDateKey(memories[0].date_happened)}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={title ?? `${memories.length} memories`}
      style={animatedStyle}
    >
      <View className="bg-surface rounded-2xl border border-ink-4/20 shadow-sm overflow-hidden">
        <View className="p-2" style={{ gap: 4 }}>
          <View className="flex-row" style={{ gap: 4 }}>
            {topRow.map((m) => (
              <GridThumbnail key={m.id} memory={m} />
            ))}
          </View>
          {bottomRow.length > 0 && (
            <View className="flex-row" style={{ gap: 4 }}>
              {bottomRow.map((m, i) =>
                i === bottomRow.length - 1 && overflow > 0 ? (
                  <OverflowThumbnail key={m.id} memory={m} count={overflow} />
                ) : (
                  <GridThumbnail key={m.id} memory={m} />
                )
              )}
            </View>
          )}
        </View>

        <View className="px-3 pb-3 pt-1">
          <View className="flex-row items-center justify-between">
            {title ? (
              <Text className="text-ink text-base font-semibold flex-1 mr-2" numberOfLines={1}>
                {title}
              </Text>
            ) : (
              <View className="flex-1" />
            )}
            <View className="bg-shade rounded-full px-2.5 py-1">
              <Text className="text-ink-2 text-xs font-medium">day album</Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between mt-1.5">
            {placeName ? (
              <View className="flex-row items-center bg-surface-2 rounded-full px-2.5 py-1">
                <View className="w-1.5 h-1.5 rounded-full bg-ink-3 mr-1.5" />
                <Text className="text-ink-3 text-xs">{placeName}</Text>
              </View>
            ) : (
              <View />
            )}
            <View className="flex-row items-center">
              <Text className="text-ink-3 text-xs mr-2">tap to open</Text>
              <View className="w-6 h-6 rounded-full bg-shade border border-ink-4/30" />
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
});
