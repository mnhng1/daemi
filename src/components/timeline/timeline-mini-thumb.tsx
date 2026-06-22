import React from "react";
import { Pressable, View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { colors, cardShadow, getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";

interface Props {
  memory: MemoryWithAuthor;
}

export function TimelineMiniThumb({ memory }: Props) {
  const router = useRouter();
  const { data: mediaUrl } = useMediaUrl(memory);

  const onPress = () => {
    router.push(`/memory/${memory.id}`);
  };

  if (memory.type === "letter") {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={memory.title ?? "Letter memory"}
        style={[
          mono ? undefined : cardShadow,
          {
            width: 50,
            height: 60,
            borderRadius: 6,
            backgroundColor: mono ? colors.surface2 : colors.letterPaper,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 5,
            overflow: "hidden",
          },
        ]}
      >
        {/* Scribble lines evoking handwriting */}
        <Text
          style={{ fontFamily: undefined, fontSize: 7, color: colors.ink3, lineHeight: 9 }}
          accessibilityElementsHidden
        >
          {"✎ ~~~\n~~ ~~\n~~~ ~\n~~"}
        </Text>
      </Pressable>
    );
  }

  if (memory.type === "ticket") {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={memory.title ?? "Ticket memory"}
        style={[
          mono ? undefined : cardShadow,
          {
            width: 70,
            height: 38,
            borderRadius: 8,
            backgroundColor: colors.accent,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={{ fontSize: 13 }} accessibilityElementsHidden>
          🎟
        </Text>
      </Pressable>
    );
  }

  // photo or video
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? (memory.type === "video" ? "Video memory" : "Photo memory")}
      style={[
        mono ? undefined : cardShadow,
        {
          width: 60,
          height: 60,
          borderRadius: 9,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.line,
        },
      ]}
    >
      {mediaUrl ? (
        <Image
          source={{ uri: mediaUrl }}
          style={{ width: 60, height: 60 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: 60, height: 60, backgroundColor: colors.shade }} />
      )}

      {memory.type === "video" && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="none"
        >
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 8,
              backgroundColor: "rgba(12,8,6,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Triangle play icon via border trick */}
            <View
              style={{
                width: 0,
                height: 0,
                borderTopWidth: 5,
                borderBottomWidth: 5,
                borderLeftWidth: 8,
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                borderLeftColor: "#ffffff",
                marginLeft: 2,
              }}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}
