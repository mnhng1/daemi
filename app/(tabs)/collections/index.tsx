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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import {
  useCollections,
  COLLECTION_STICKER_TAGS,
  formatCollectionSubtitle,
} from "../../../src/features/collections";
import type { CollectionWithMeta, CollectionCover } from "../../../src/features/collections";
import { useMediaUrl } from "../../../src/features/media";
import { useSession } from "../../../src/features/auth";
import { CreateCollectionSheet } from "../../../src/components/collections/create-collection-sheet";
import { IconButton } from "../../../src/components/ui/icon-button";
import { Sticker } from "../../../src/components/ui/sticker";
import { colors, fonts, cardShadow } from "../../../src/lib/theme/tokens";

// Single polaroid tile — always rendered so hook is never called conditionally.
function CoverTile({
  cover,
  coupleSpaceId,
}: {
  cover: CollectionCover | null;
  coupleSpaceId: string;
}) {
  const coverMemory =
    cover !== null
      ? {
          id: cover.id,
          couple_space_id: coupleSpaceId,
          storage_key: cover.storage_key,
          media_url: null,
        }
      : null;

  const { data: url } = useMediaUrl(coverMemory);

  const tileStyle = {
    width: 48,
    height: 46,
    borderRadius: 9,
    overflow: "hidden" as const,
    borderWidth: 2,
    borderColor: colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  };

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[tileStyle, { backgroundColor: colors.surface2 }]}
        resizeMode="cover"
      />
    );
  }

  return <View style={[tileStyle, { backgroundColor: colors.surface2 }]} />;
}

// Two-photo polaroid stack — 62×58 relative container.
function CoverStack({
  covers,
  coupleSpaceId,
}: {
  covers: CollectionCover[];
  coupleSpaceId: string;
}) {
  const back = covers[1] ?? null;
  const front = covers[0] ?? null;

  return (
    <View style={{ width: 62, height: 58, position: "relative", flexShrink: 0 }}>
      {/* Back tile rendered first (behind) */}
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 0,
          transform: [{ rotate: "-4deg" }],
        }}
      >
        <CoverTile cover={back} coupleSpaceId={coupleSpaceId} />
      </View>
      {/* Front tile rendered last (on top) */}
      <View
        style={{
          position: "absolute",
          top: 2,
          left: 12,
          transform: [{ rotate: "5deg" }],
        }}
      >
        <CoverTile cover={front} coupleSpaceId={coupleSpaceId} />
      </View>
    </View>
  );
}

function CollectionCard({
  item,
  coupleSpaceId,
}: {
  item: CollectionWithMeta;
  coupleSpaceId: string;
}) {
  const subtitle = formatCollectionSubtitle(
    item.start_date,
    item.end_date,
    item.memory_count,
  );

  return (
    <Pressable
      onPress={() => router.push(`/collections/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      // Static style: css-interop's wrapped Pressable ignores the function form.
      style={[
        cardShadow,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 13,
          paddingVertical: 11,
          paddingHorizontal: 13,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
          marginHorizontal: 16,
          marginBottom: 13,
          position: "relative",
        },
      ]}
    >
      <CoverStack covers={item.covers} coupleSpaceId={coupleSpaceId} />

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{ fontFamily: fonts.display, fontSize: 19, color: colors.ink, lineHeight: 22 }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontFamily: fonts.ui,
            fontSize: 11,
            color: colors.ink2,
            marginTop: 3,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Sticker text={COLLECTION_STICKER_TAGS[item.type]} rotate={6} top={-7} right={8} />

      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.ink3} />
    </Pressable>
  );
}

// Dashed "new collection" footer button — also used in empty state.
function NewCollectionButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Create new collection"
      // Static style: css-interop's wrapped Pressable ignores the function form.
      style={{
        marginHorizontal: 16,
        marginTop: 4,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: colors.ink4,
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <MaterialCommunityIcons name="plus" size={18} color={colors.ink2} />
      <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.ink2 }}>
        new collection
      </Text>
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

  const canCreate = !!(spaceId && userId);

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

  const listFooter = (
    <NewCollectionButton onPress={() => setCreateVisible(true)} />
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.paper }}
      edges={["top"]}
    >
      {/* Header — Change 3 */}
      <View
        style={{
          paddingTop: 6,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
        }}
      >
        <View style={{ minWidth: 34, alignItems: "flex-start" }} />

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 24,
              color: colors.ink,
              lineHeight: 26,
            }}
          >
            Collections
          </Text>
          {data != null && (
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 11,
                color: colors.ink3,
                marginTop: 1,
              }}
            >
              {`${data.length} collections`}
            </Text>
          )}
        </View>

        <View style={{ minWidth: 34, alignItems: "flex-end" }}>
          <View style={{ opacity: canCreate ? 1 : 0.3 }}>
            <IconButton
              icon="plus"
              onPress={() => setCreateVisible(true)}
              accessibilityLabel="Create collection"
            />
          </View>
        </View>
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
              fontFamily: fonts.ui,
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
            gap: 20,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 15,
              color: colors.ink3,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            {"No collections yet.\nGroup your memories into trips, anniversaries, and more."}
          </Text>
          <NewCollectionButton onPress={() => setCreateVisible(true)} />
        </View>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          ListFooterComponent={listFooter}
        />
      )}
    </SafeAreaView>
  );
}
