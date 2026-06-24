import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl, useThumbnailUrl } from "../../features/media";
import { colors } from "../../lib/theme/tokens";
import { useTabBarSpace } from "../navigation/tab-bar-metrics";

// Monochrome ("Threads-style") aggregate view: a flat photo-grid gallery used by the
// month and year zoom levels in place of the scrapbook spine/volume-bar layout.
// Photos are the only color; everything else is neutral. Grouped by a section label
// (month or year) with a plain text header.

export interface GallerySection {
  key: string;
  label: string;
  sub?: string;
  items: MemoryWithAuthor[];
}

const COLS = 3;
const GAP = 6;
const H_PAD = 16;

function PlayBadge() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 5,
        left: 5,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 0,
          height: 0,
          borderTopWidth: 4,
          borderBottomWidth: 4,
          borderLeftWidth: 7,
          borderTopColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "#fff",
          marginLeft: 1.5,
        }}
      />
    </View>
  );
}

function ThumbShell({
  memory,
  url,
  size,
  video,
}: {
  memory: MemoryWithAuthor;
  url: string | null | undefined;
  size: number;
  video?: boolean;
}) {
  const router = useRouter();
  // Letters have no media; tickets carry a stub photo. Fall back to a neutral tile
  // with the type label when there's no image.
  const label = memory.type === "letter" ? "letter" : memory.type === "ticket" ? "ticket" : null;
  const showImg = !!url && memory.type !== "letter";

  return (
    <Pressable
      onPress={() => router.push(`/memory/${memory.id}`)}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? `${memory.type} memory`}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: colors.shade,
      }}
    >
      {showImg ? (
        <Image source={{ uri: url }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 4 }}>
          {memory.type === "letter" && memory.body ? (
            <Text
              style={{ fontSize: 8, color: colors.ink3, lineHeight: 11 }}
              numberOfLines={5}
            >
              {memory.body}
            </Text>
          ) : (
            <Text
              style={{ fontSize: 10, color: colors.ink3, textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              {label ?? ""}
            </Text>
          )}
        </View>
      )}
      {video && <PlayBadge />}
    </Pressable>
  );
}

function VideoThumb({ memory, size }: { memory: MemoryWithAuthor; size: number }) {
  const { data } = useThumbnailUrl(memory);
  return <ThumbShell memory={memory} url={data} size={size} video />;
}

function MediaThumb({ memory, size }: { memory: MemoryWithAuthor; size: number }) {
  const { data } = useMediaUrl(memory);
  return <ThumbShell memory={memory} url={data} size={size} />;
}

function Thumb({ memory, size }: { memory: MemoryWithAuthor; size: number }) {
  // Distinct components keep the hook order stable (video → poster, else → media URL).
  return memory.type === "video" ? (
    <VideoThumb memory={memory} size={size} />
  ) : (
    <MediaThumb memory={memory} size={size} />
  );
}

interface Props {
  sections: GallerySection[];
  onRefresh?: () => void;
}

export function MonoGallery({ sections, onRefresh }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.floor((width - H_PAD * 2 - GAP * (COLS - 1)) / COLS);
  const tabBarSpace = useTabBarSpace();

  return (
    <ScrollView
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.ink} />
        ) : undefined
      }
      contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: 8, paddingBottom: tabBarSpace }}
    >
      {sections.map((s) => (
        <View key={s.key} style={{ marginBottom: 22 }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: colors.ink }}>{s.label}</Text>
          {s.sub ? (
            <Text style={{ fontSize: 12, color: colors.ink3, marginTop: 1 }}>{s.sub}</Text>
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP, marginTop: 10 }}>
            {s.items.map((m) => (
              <Thumb key={m.id} memory={m} size={size} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
