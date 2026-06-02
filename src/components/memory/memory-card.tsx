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
import { PhotoMemoryCard } from "./photo-memory-card";
import { LetterMemoryCard } from "./letter-memory-card";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  memory: MemoryWithAuthor;
  index: number;
}

export const MemoryCard = React.memo(function MemoryCard({ memory, index }: Props) {
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

  return (
    <AnimatedPressable
      onPress={() => router.push(`/memory/${memory.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? `${memory.type} memory`}
      style={animatedStyle}
    >
      {memory.type === "letter" ? (
        <LetterMemoryCard memory={memory} />
      ) : (
        <PhotoMemoryCard memory={memory} index={index} />
      )}
    </AnimatedPressable>
  );
});
