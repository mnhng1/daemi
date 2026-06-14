import React from "react";
import { View, Text, Pressable } from "react-native";
import { colors, cardShadow } from "../../lib/theme/tokens";

export type ZoomLevel = "day" | "month" | "year";

const LEVELS: ZoomLevel[] = ["year", "month", "day"];

interface Props {
  zoom: ZoomLevel;
  onChange: (z: ZoomLevel) => void;
}

export function TimelineZoomBar({ zoom, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingTop: 6,
        paddingBottom: 8,
      }}
    >
      {/* ZOOM label */}
      <Text
        style={{
          fontSize: 9.5,
          fontWeight: "700",
          letterSpacing: 1,
          textTransform: "uppercase",
          color: colors.ink3,
        }}
      >
        zoom
      </Text>

      {/* Segmented track */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface2,
          borderRadius: 10,
          padding: 3,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        {LEVELS.map((level) => {
          const active = zoom === level;
          return (
            <Pressable
              key={level}
              onPress={() => onChange(level)}
              accessibilityRole="tab"
              accessibilityLabel={`Zoom ${level}`}
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 13,
                  paddingVertical: 4,
                  minHeight: 44,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? colors.surface : "transparent",
                  opacity: pressed ? 0.7 : 1,
                },
                active ? cardShadow : undefined,
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: active ? "700" : "500",
                  color: active ? colors.ink : colors.ink3,
                }}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Pinch hint */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        {/* Magnifier glyph — lightweight, no icon dep */}
        <Text style={{ fontSize: 12, color: colors.ink3 }}>⌕</Text>
        <Text style={{ fontSize: 10.5, color: colors.ink3 }}>pinch</Text>
      </View>
    </View>
  );
}
