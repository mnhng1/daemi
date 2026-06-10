import { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useSpacePlaces } from "../../../src/features/places";
import type { SpacePlace } from "../../../src/features/places";
import { colors } from "../../../src/lib/theme/tokens";

function PlaceCard({ item }: { item: SpacePlace }) {
  const memoryLabel =
    item.memory_count === 1 ? "1 memory" : `${item.memory_count} memories`;

  return (
    <Pressable
      onPress={() =>
        router.push(`/places/${encodeURIComponent(item.place_name)}`)
      }
      accessibilityRole="button"
      accessibilityLabel={item.place_name}
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
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: colors.ink }}
          numberOfLines={1}
        >
          {item.place_name}
        </Text>
        <Text style={{ fontSize: 13, color: colors.ink2 }}>{memoryLabel}</Text>
      </View>
    </Pressable>
  );
}

export default function PlacesListScreen() {
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces?.id;

  const { data: places, isLoading, isError } = useSpacePlaces(spaceId);

  const renderItem = useCallback(
    ({ item }: { item: SpacePlace }) => <PlaceCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: SpacePlace) => item.place_name, []);

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
          Places
        </Text>
      </View>

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
            {"Couldn't load places. Please try again."}
          </Text>
        </View>
      )}

      {!isLoading && !isError && places && places.length === 0 && (
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
            {"No places yet.\nPlaces appear here when you add one to a memory."}
          </Text>
        </View>
      )}

      {!isLoading && !isError && places && places.length > 0 && (
        <FlatList
          data={places}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
        />
      )}
    </SafeAreaView>
  );
}
