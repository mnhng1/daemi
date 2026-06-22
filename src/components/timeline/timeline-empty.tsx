import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fonts, getAppearance } from "../../lib/theme/tokens";
import { DATE_W, NODE_W, CONNECTOR_W } from "./layout";
import { TimelineSpineLine } from "./timeline-spine-line";
import { TimelineTodayCap } from "./timeline-today-cap";
import { TimelineNode } from "./timeline-node";
import { Sticker } from "../ui/sticker";

// Prototype EmptyTimeline (04-timeline.js:264-286): spine + today cap + a single
// dashed-accent card branching off a hollow node, with a "start here ↓" sticker.
export function TimelineEmpty() {
  const router = useRouter();
  // Monochrome: a flat, centered prompt — no spine, node, dashed card or sticker.
  if (getAppearance() === "monochrome") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: colors.ink, textAlign: "center", lineHeight: 28 }}>
          Your scrapbook starts here.
        </Text>
        <Text style={{ fontSize: 14, color: colors.ink2, textAlign: "center", marginTop: 10, lineHeight: 20 }}>
          Add a photo, letter, place or anything you want to keep, together.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add your first memory"
          onPress={() => router.push("/(tabs)/add")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginTop: 22,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 13,
            backgroundColor: colors.accent,
          }}
        >
          <MaterialCommunityIcons name="plus" size={16} color="#fff" />
          <Text style={{ fontSize: 14.5, fontWeight: "600", color: "#fff" }}>add your first memory</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative", paddingLeft: 0, paddingRight: 16, paddingTop: 16 }}>
      <TimelineSpineLine />
      <TimelineTodayCap />

      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ width: DATE_W }} />
        <View style={{ width: NODE_W, alignItems: "center", paddingTop: 6 }}>
          <TimelineNode />
        </View>
        <View
          style={{
            width: CONNECTOR_W,
            marginTop: 12,
            borderTopWidth: 1.5,
            borderStyle: "dashed",
            borderColor: colors.ink4,
          }}
        />
        <View style={{ flex: 1 }}>
          <View
            style={{
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: colors.accent,
              borderRadius: 16,
              backgroundColor: colors.surface,
              paddingVertical: 18,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 26,
                fontWeight: "700",
                color: colors.ink,
                lineHeight: 28,
              }}
            >
              your scrapbook{"\n"}starts here.
            </Text>
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 12.5,
                color: colors.ink2,
                marginTop: 8,
                marginBottom: 14,
                lineHeight: 18,
              }}
            >
              add a photo, letter, place or anything you want to keep, together.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add your first memory"
              onPress={() => router.push("/(tabs)/add")}
              // Static style: css-interop's wrapped Pressable ignores the function form.
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 7,
                paddingVertical: 11,
                paddingHorizontal: 18,
                borderRadius: 13,
                backgroundColor: colors.accent,
              }}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={{ fontFamily: fonts.ui, fontSize: 14.5, fontWeight: "600", color: "#fff" }}>
                add your first memory
              </Text>
            </Pressable>
          </View>
          <Sticker text="start here ↓" rotate={6} top={-12} right={-4} />
        </View>
      </View>
    </View>
  );
}
