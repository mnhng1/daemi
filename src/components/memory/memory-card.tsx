import React from "react";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { MemoryWithAuthor } from "../../types/database";
import { isQueuedMemory } from "../../features/memories";
import type { QueuedMemory } from "../../features/queue";
import { PhotoMemoryCard } from "./photo-memory-card";
import { LetterMemoryCard } from "./letter-memory-card";
import { VideoMemoryCard } from "./video-memory-card";
import { TicketMemoryCard } from "./ticket-memory-card";
import { QueuedMemoryCard } from "./queued-memory-card";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  memory: MemoryWithAuthor | QueuedMemory;
  index: number;
  rotation?: number;
}

interface InnerProps {
  memory: MemoryWithAuthor;
  index: number;
  rotation?: number;
}

function MemoryCardInner({ memory, index, rotation = 0 }: InnerProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Scrapbook tilt (prototype tilt()) baked into the press transform.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation}deg` }, { scale: scale.value }],
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

  return (
    <AnimatedPressable
      onPress={() => router.push(`/memory/${memory.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? `${memory.type} memory`}
      style={animatedStyle}
    >
      {(() => {
        switch (memory.type) {
          case "video":
            return <VideoMemoryCard memory={memory} index={index} />;
          case "ticket":
            return <TicketMemoryCard memory={memory} />;
          case "letter":
            return <LetterMemoryCard memory={memory} />;
          default:
            return <PhotoMemoryCard memory={memory} index={index} />;
        }
      })()}
    </AnimatedPressable>
  );
}

export const MemoryCard = React.memo(function MemoryCard({ memory, index, rotation }: Props) {
  if (isQueuedMemory(memory)) return <QueuedMemoryCard item={memory} />;
  return <MemoryCardInner memory={memory} index={index} rotation={rotation} />;
});
