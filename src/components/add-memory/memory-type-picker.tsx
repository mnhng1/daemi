import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../lib/theme/tokens";

const SHEET_HEIGHT = 520;
const DISMISS_THRESHOLD = 120;

const CARD_ICON_SIZE = 24;
const CARD_ICON_BOX = 46;
const CARD_ICON_RADIUS = 14;
const CARD_ICON_MARGIN = 12;
const CARD_PADDING_V = 18;
const CARD_PADDING_H = 18;
const CARD_TITLE_SIZE = 21;
const CARD_SUBTITLE_SIZE = 13;
const CARD_RADIUS = 18;
const CARD_GAP = 14;

type MemoryType = "photo" | "video" | "letter" | "ticket";

interface TypeCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  disabled?: boolean;
}

function TypeCard({ icon, title, subtitle, onPress, disabled }: TypeCardProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        !disabled && pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={CARD_ICON_SIZE} color={colors.accent} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

interface Props {
  onSelect: (type: "photo" | "video" | "letter" | "ticket") => void;
  onDismiss: () => void;
}

export function MemoryTypePicker({ onSelect, onDismiss }: Props) {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 260 });
    backdropOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  function animateDismiss() {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }

  function handleDismiss() {
    animateDismiss();
    setTimeout(onDismiss, 220);
  }

  function handleSelect(type: "photo" | "video" | "letter" | "ticket") {
    animateDismiss();
    setTimeout(() => onSelect(type), 220);
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        translateY.value = withTiming(SHEET_HEIGHT, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 260 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          <Text style={styles.title}>add a memory</Text>
          <Text style={styles.subtitle}>what kind?</Text>

          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <TypeCard
                icon="image-outline"
                title="photo"
                subtitle="snap a moment"
                onPress={() => handleSelect("photo")}
              />
              <TypeCard
                icon="video-outline"
                title="video"
                subtitle="share a clip"
                onPress={() => handleSelect("video")}
              />
            </View>
            <View style={styles.gridRow}>
              <TypeCard
                icon="pencil-outline"
                title="letter"
                subtitle="write to them"
                onPress={() => handleSelect("letter")}
              />
              <TypeCard
                icon="ticket-outline"
                title="ticket"
                subtitle="stub · receipt · postcard"
                onPress={() => handleSelect("ticket")}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerIcon}>📍</Text>
            <Text style={styles.footerText}>
              you can pin a place & add to a collection inside any memory.
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: "rgba(42, 37, 32, 0.25)",
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
    alignSelf: "stretch",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: colors.ink4,
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    fontFamily: "CormorantInfant_600SemiBold",
    fontSize: 28,
    textAlign: "center",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: colors.ink3,
    marginBottom: 24,
    marginTop: 2,
  },
  grid: {
    gap: CARD_GAP,
  },
  gridRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  card: {
    flex: 1,
    minHeight: 124,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.ink4 + "55",
    paddingVertical: CARD_PADDING_V,
    paddingHorizontal: CARD_PADDING_H,
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: CARD_ICON_BOX,
    height: CARD_ICON_BOX,
    borderRadius: CARD_ICON_RADIUS,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: CARD_ICON_MARGIN,
  },
  cardTitle: {
    fontFamily: "CormorantInfant_600SemiBold",
    fontSize: CARD_TITLE_SIZE,
    color: colors.ink,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: CARD_SUBTITLE_SIZE,
    color: colors.ink3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 4,
  },
  footerIcon: {
    fontSize: 12,
  },
  footerText: {
    color: colors.ink3,
    fontSize: 12,
  },
});
