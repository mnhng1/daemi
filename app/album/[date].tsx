import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Pressable, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentCoupleSpace } from "../../src/features/couple-space";
import { useMemories } from "../../src/features/memories";
import { toDateKey, formatTimelineDate } from "../../src/lib/utils/date";
import { useMediaUrl } from "../../src/features/media";
import { MemoryWithAuthor } from "../../src/types/database";
import { colors } from "../../src/lib/theme/tokens";

function AlbumPhotoItem({ memory }: { memory: MemoryWithAuthor }) {
  const router = useRouter();
  const { data: mediaUrl } = useMediaUrl(memory);

  return (
    <Pressable
      onPress={() => router.push(`/memory/${memory.id}`)}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? "Photo memory"}
    >
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.ink4 + "33", overflow: "hidden", marginBottom: 12 }}>
        <View style={{ padding: 8 }}>
          {mediaUrl ? (
            <Image
              source={{ uri: mediaUrl }}
              style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 10, backgroundColor: colors.shade }} />
          )}
        </View>
        <View style={{ paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4 }}>
          {memory.title && (
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
              {memory.title}
            </Text>
          )}
          {memory.body && (
            <Text style={{ color: colors.ink2, fontSize: 14, lineHeight: 20, marginTop: 4 }} numberOfLines={2}>
              {memory.body}
            </Text>
          )}
          {memory.place_name && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ink3, marginRight: 6 }} />
              <Text style={{ color: colors.ink3, fontSize: 12 }}>{memory.place_name}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function AlbumLetterItem({ memory }: { memory: MemoryWithAuthor }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/memory/${memory.id}`)}
      accessibilityRole="button"
      accessibilityLabel={memory.title ?? "Letter memory"}
    >
      <View style={{ backgroundColor: colors.letterPaper, borderRadius: 16, borderWidth: 1, borderColor: colors.ink4 + "33", overflow: "hidden", marginBottom: 12, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View style={{ backgroundColor: colors.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>Letter</Text>
          </View>
        </View>
        {memory.title && (
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600", marginBottom: 4 }} numberOfLines={1}>
            {memory.title}
          </Text>
        )}
        {memory.body && (
          <Text style={{ color: colors.ink2, fontSize: 14, lineHeight: 20 }} numberOfLines={3}>
            {memory.body}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function AlbumView() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces.id;
  const { data: memories, isLoading } = useMemories(spaceId, "all");

  const dayMemories = (memories ?? []).filter(
    (m) => toDateKey(m.date_happened) === date
  );

  const title = date ? formatTimelineDate(date) : "Album";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Text style={{ fontSize: 24, color: colors.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }} numberOfLines={1}>
            {title}
          </Text>
          {!isLoading && (
            <Text style={{ color: colors.ink3, fontSize: 13, marginTop: 1 }}>
              {dayMemories.length} {dayMemories.length === 1 ? "memory" : "memories"}
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {dayMemories.map((memory) =>
            memory.type === "letter" ? (
              <AlbumLetterItem key={memory.id} memory={memory} />
            ) : (
              <AlbumPhotoItem key={memory.id} memory={memory} />
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
