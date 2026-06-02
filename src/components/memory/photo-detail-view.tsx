import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { formatTimelineDate } from "../../lib/utils/date";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export function PhotoDetailView({ memory }: Props) {
  const router = useRouter();
  const { data: mediaUrl } = useMediaUrl(memory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={{ fontSize: 24, color: colors.ink }}>←</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          {mediaUrl && (
            <Image
              source={{ uri: mediaUrl }}
              style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 12 }}
              resizeMode="cover"
            />
          )}

          {memory.title && (
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "600", marginTop: 16 }}>
              {memory.title}
            </Text>
          )}

          {memory.body && (
            <Text style={{ color: colors.ink2, fontSize: 16, lineHeight: 24, marginTop: 8 }}>
              {memory.body}
            </Text>
          )}

          <Text style={{ color: colors.ink3, fontSize: 14, marginTop: 12 }}>
            {formatTimelineDate(memory.date_happened)}
          </Text>

          {memory.place_name && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ink3, marginRight: 6 }} />
              <Text style={{ color: colors.ink3, fontSize: 14 }}>{memory.place_name}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
