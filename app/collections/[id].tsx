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
import {
  useCollection,
  COLLECTION_TYPE_LABELS,
  formatCollectionDateRange,
} from "../../src/features/collections";
import { MemoryCard } from "../../src/components/memory/memory-card";
import type { MemoryWithAuthor } from "../../src/types/database";
import { colors } from "../../src/lib/theme/tokens";

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useCollection(id);

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
        style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: colors.ink, fontSize: 16, marginBottom: 16 }}>
          Collection not found
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.accent, fontSize: 16 }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { collection, memories } = data;
  const dateRange = formatCollectionDateRange(
    collection.start_date,
    collection.end_date,
  );
  const typeLabel = COLLECTION_TYPE_LABELS[collection.type];

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
            {collection.name}
          </Text>
          <Text style={{ color: colors.ink3, fontSize: 13, marginTop: 1 }}>
            {typeLabel}
            {dateRange ? `  ·  ${dateRange}` : ""}
          </Text>
        </View>
      </View>
      {collection.description ? (
        <Text
          style={{
            color: colors.ink2,
            fontSize: 14,
            lineHeight: 20,
            marginTop: 4,
          }}
        >
          {collection.description}
        </Text>
      ) : null}
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
        No memories in this collection yet.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        data={memories}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}
