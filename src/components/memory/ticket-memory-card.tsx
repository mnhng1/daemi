import React from "react";
import { View, Text, Image } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export const TicketMemoryCard = React.memo(function TicketMemoryCard({ memory }: Props) {
  const { data: stubPhotoUrl } = useMediaUrl(memory);

  return (
    <View
      className="rounded-2xl border border-ink-4/20 shadow-sm overflow-hidden"
      style={{ backgroundColor: colors.surface, minHeight: 84, flexDirection: "row" }}
    >
      {/* Left stub-photo panel */}
      <View style={{ width: 98, flexShrink: 0 }}>
        {stubPhotoUrl ? (
          <Image
            source={{ uri: stubPhotoUrl }}
            style={{ width: 98, height: "100%" }}
            resizeMode="cover"
            accessibilityLabel="Ticket stub photo"
          />
        ) : (
          <View
            style={{ width: 98, height: "100%", backgroundColor: colors.shade }}
          />
        )}
      </View>

      {/* Perforation */}
      <View style={{ position: "relative", width: 0 }}>
        {/* Dashed line */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: -0.5,
            borderLeftWidth: 1.5,
            borderLeftColor: colors.ink4,
            borderStyle: "dashed",
          }}
        />
        {/* Top semicircle cutout */}
        <View
          style={{
            position: "absolute",
            top: -7,
            left: -7,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: colors.ink4,
          }}
        />
        {/* Bottom semicircle cutout */}
        <View
          style={{
            position: "absolute",
            bottom: -7,
            left: -7,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: colors.ink4,
          }}
        />
      </View>

      {/* Right content panel */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 13,
          paddingVertical: 11,
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        {/* "ADMIT ONE" label */}
        <View className="flex-row items-center gap-1 mb-0.5">
          <Text style={{ fontSize: 9.5 }}>🎟</Text>
          <Text
            className="text-ink-3 font-bold uppercase tracking-widest"
            style={{ fontSize: 9.5 }}
          >
            admit one
          </Text>
        </View>

        {/* Title */}
        <Text
          className="text-ink font-bold"
          style={{ fontSize: 18, lineHeight: 20 }}
          numberOfLines={1}
        >
          {memory.title ?? "Untitled"}
        </Text>

        {/* Subtitle: place or date */}
        {(memory.place_name || memory.date_happened) && (
          <Text
            className="text-ink-2"
            style={{ fontSize: 11.5, marginTop: 3 }}
            numberOfLines={1}
          >
            {memory.place_name ?? memory.date_happened}
          </Text>
        )}

        {/* Reactions / meta row */}
        {memory.reactions.length > 0 && (
          <View className="flex-row items-center gap-1 mt-2">
            <Text style={{ fontSize: 12 }}>❤️</Text>
          </View>
        )}
      </View>
    </View>
  );
});
