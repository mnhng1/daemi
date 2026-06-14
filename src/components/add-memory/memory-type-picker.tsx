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
import { colors, fonts, cardShadow } from "../../lib/theme/tokens";

const SHEET_HEIGHT = 520;
const DISMISS_THRESHOLD = 120;

// Card metrics mirror the prototype TypePicker (docs/prototype/src/05-add-composer.js).
const CARD_ICON_SIZE = 20;
const CARD_ICON_BOX = 38;
const CARD_ICON_RADIUS = 11;
const CARD_ICON_MARGIN = 8;
const CARD_PADDING_V = 14;
const CARD_PADDING_H = 14;
const CARD_TITLE_SIZE = 19;
const CARD_SUBTITLE_SIZE = 11;
const CARD_RADIUS = 16;
const CARD_GAP = 11;

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
      // Static style: css-interop's wrapped Pressable ignores the function form.
      style={[styles.card, disabled && styles.cardDisabled]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={CARD_ICON_SIZE} color={colors.accentText} />
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
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.ink3} />
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 14,
    alignSelf: "stretch",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    backgroundColor: colors.ink4,
    borderRadius: 3,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 25,
    textAlign: "center",
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 12,
    textAlign: "center",
    color: colors.ink3,
    marginBottom: 16,
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
    minHeight: 108,
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: CARD_PADDING_V,
    paddingHorizontal: CARD_PADDING_H,
    alignItems: "flex-start",
    justifyContent: "center",
    ...cardShadow,
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
    fontFamily: fonts.display,
    fontSize: CARD_TITLE_SIZE,
    color: colors.ink,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontFamily: fonts.ui,
    fontSize: CARD_SUBTITLE_SIZE,
    color: colors.ink3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  footerText: {
    flex: 1,
    fontFamily: fonts.ui,
    color: colors.ink2,
    fontSize: 11,
    lineHeight: 15,
  },
});
