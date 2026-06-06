import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import {
  useCollections,
  COLLECTION_TYPE_LABELS,
  formatCollectionDateRange,
} from "../../../src/features/collections";
import type { CollectionWithMeta } from "../../../src/features/collections";
import { useMediaUrl } from "../../../src/features/media";
import { useSession } from "../../../src/features/auth";
import { CreateCollectionSheet } from "../../../src/components/collections/create-collection-sheet";
import { colors } from "../../../src/lib/theme/tokens";

// Cover image sub-component — keeps hook usage at the component level.
function CollectionCover({
  memoryId,
  storageKey,
  coupleSpaceId,
}: {
  memoryId: string | null;
  storageKey: string | null;
  coupleSpaceId: string;
}) {
  // Pass the real cover memory's id — media-presign authorizes by memory id.
  const coverMemory =
    memoryId && storageKey
      ? {
          id: memoryId,
          couple_space_id: coupleSpaceId,
          storage_key: storageKey,
          media_url: null,
        }
      : null;

  const { data: url } = useMediaUrl(coverMemory);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: 72, height: 72, borderRadius: 10 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: 72,
        height: 72,
        borderRadius: 10,
        backgroundColor: colors.surface2,
      }}
    />
  );
}

function CollectionCard({
  item,
  coupleSpaceId,
}: {
  item: CollectionWithMeta;
  coupleSpaceId: string;
}) {
  const dateRange = formatCollectionDateRange(item.start_date, item.end_date);
  const memoryLabel =
    item.memory_count === 1 ? "1 memory" : `${item.memory_count} memories`;

  return (
    <Pressable
      onPress={() => router.push(`/collections/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 12,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <CollectionCover
        memoryId={item.cover_memory_id}
        storageKey={item.cover_storage_key}
        coupleSpaceId={coupleSpaceId}
      />
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: colors.ink }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.ink3 }}>
          {COLLECTION_TYPE_LABELS[item.type]}
        </Text>
        <Text style={{ fontSize: 13, color: colors.ink2 }}>{memoryLabel}</Text>
        {dateRange && (
          <Text style={{ fontSize: 12, color: colors.ink3 }}>{dateRange}</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function CollectionsListScreen() {
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces?.id;

  const { session } = useSession();
  const userId = session?.user.id;

  const [createVisible, setCreateVisible] = useState(false);

  const { data, isLoading, isError } = useCollections(spaceId);

  const renderItem = useCallback(
    ({ item }: { item: CollectionWithMeta }) => (
      <CollectionCard item={item} coupleSpaceId={spaceId!} />
    ),
    [spaceId],
  );

  const keyExtractor = useCallback(
    (item: CollectionWithMeta) => item.id,
    [],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.paper }}
      edges={["top"]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.ink }}>
          Collections
        </Text>
        <Pressable
          onPress={() => setCreateVisible(true)}
          disabled={!spaceId || !userId}
          accessibilityRole="button"
          accessibilityLabel="Create collection"
          hitSlop={12}
          style={({ pressed }) => ({
            opacity: !spaceId || !userId ? 0.3 : pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 28, color: colors.accent, lineHeight: 32 }}>
            +
          </Text>
        </Pressable>
      </View>

      {spaceId && userId && (
        <CreateCollectionSheet
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          coupleSpaceId={spaceId}
          userId={userId}
          onCreated={(id) => router.push(`/collections/${id}`)}
        />
      )}

      {isLoading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: colors.ink3,
              textAlign: "center",
            }}
          >
            {"Couldn't load collections. Please try again."}
          </Text>
        </View>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
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
            {"No collections yet.\nGroup your memories into trips, anniversaries, and more."}
          </Text>
        </View>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}
