import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentCoupleSpace } from "../../src/features/couple-space";
import { usePlaceMemories } from "../../src/features/places";
import { MemoryCard } from "../../src/components/memory/memory-card";
import type { MemoryWithAuthor } from "../../src/types/database";
import { colors } from "../../src/lib/theme/tokens";

export default function PlaceDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();

  const rawName = Array.isArray(name) ? name[0] : name;
  const placeName = rawName ? decodeURIComponent(rawName) : "";

  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces?.id;

  const { data: memories, isLoading } = usePlaceMemories(spaceId, placeName);

  const renderItem = useCallback(
    ({ item, index }: { item: MemoryWithAuthor; index: number }) => (
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <MemoryCard memory={item} index={index} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: MemoryWithAuthor) => item.id, []);

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.paper,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          marginBottom: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Text style={{ fontSize: 24, color: colors.ink }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}
            numberOfLines={1}
          >
            {placeName}
          </Text>
        </View>
      </View>
    </View>
  );

  const ListEmpty = (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 64,
        paddingHorizontal: 32,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: colors.ink3,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        No memories at this place yet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        data={memories ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}
