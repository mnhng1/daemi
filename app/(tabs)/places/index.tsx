import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarSpace } from "../../../src/components/navigation/tab-bar-metrics";
import { router } from "expo-router";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import {
  useSpacePlaces,
  useSpaceCoordinates,
} from "../../../src/features/places";
import type { SpacePlace } from "../../../src/features/places";
import { PlacesMap } from "../../../src/components/places/places-map";
import { colors, fonts } from "../../../src/lib/theme/tokens";

type ViewMode = "list" | "map";

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
      // Static style: css-interop's wrapped Pressable ignores the function form.
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.surface2,
        padding: 14,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
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

function ModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: active ? colors.accent : colors.surface,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: active ? colors.surface : colors.ink2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function PlacesListScreen() {
  const tabBarSpace = useTabBarSpace();
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces?.id;

  const [mode, setMode] = useState<ViewMode>("list");

  const { data: places, isLoading, isError } = useSpacePlaces(spaceId);
  const { data: coordinates } = useSpaceCoordinates(spaceId);

  const renderItem = useCallback(
    ({ item }: { item: SpacePlace }) => <PlaceCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: SpacePlace) => item.place_name, []);

  const coords = coordinates ?? [];

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
          paddingTop: 6,
          paddingBottom: 12,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 28,
            color: colors.ink,
            lineHeight: 30,
          }}
        >
          Places
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <ModeChip
            label="List"
            active={mode === "list"}
            onPress={() => setMode("list")}
          />
          <ModeChip
            label="Map"
            active={mode === "map"}
            onPress={() => setMode("map")}
          />
        </View>
      </View>

      {mode === "map" ? (
        coords.length === 0 ? (
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
              {
                "No places with a location yet.\nPlaces added without a location won't appear on the map."
              }
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <PlacesMap
              coordinates={coords}
              onMarkerPress={(name) =>
                router.push(`/places/${encodeURIComponent(name)}`)
              }
            />
          </View>
        )
      ) : (
        <>
          {isLoading && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
              style={{ flex: 1 }}
              data={places}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={{ paddingTop: 4, paddingBottom: tabBarSpace }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
