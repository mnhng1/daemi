import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBarSpace } from "../../../src/components/navigation/tab-bar-metrics";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useSearchMemories, useSpaceTags } from "../../../src/features/search";
import { MemoryCard } from "../../../src/components/memory/memory-card";
import { colors } from "../../../src/lib/theme/tokens";
import type { MemoryWithAuthor } from "../../../src/types/database";

export default function Search() {
  const tabBarSpace = useTabBarSpace();
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const spaceId = coupleSpace?.couple_spaces?.id;

  const [rawInput, setRawInput] = useState("");
  const [query, setQuery] = useState("");

  // Debounce: 250ms
  useEffect(() => {
    const t = setTimeout(() => setQuery(rawInput), 250);
    return () => clearTimeout(t);
  }, [rawInput]);

  const { data, isFetching } = useSearchMemories(spaceId, query);
  const { data: spaceTags } = useSpaceTags(spaceId);

  const trimmedQuery = query.trim();
  const isIdle = trimmedQuery.length === 0 || (trimmedQuery === "#");
  const hasResults = !isIdle && !isFetching && data && data.length > 0;
  const noResults = !isIdle && !isFetching && data && data.length === 0;

  // Suggestion chips: space tags not already in the active tag query
  const activeTagTokens = trimmedQuery.startsWith("#")
    ? trimmedQuery
        .split(/\s+/)
        .map((t) => t.replace(/^#/, "").toLowerCase())
        .filter(Boolean)
    : [];
  const suggestionTags = (spaceTags ?? []).filter(
    (tag) => !activeTagTokens.includes(tag),
  );

  const handleTagChipPress = useCallback(
    (tag: string) => {
      setRawInput(`#${tag}`);
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MemoryWithAuthor; index: number }) => (
      <MemoryCard memory={item} index={index} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: MemoryWithAuthor) => item.id, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.paper }}
      edges={["top"]}
    >
      {/* Search input */}
      <View className="px-4 pt-2 pb-3">
        <TextInput
          value={rawInput}
          onChangeText={setRawInput}
          placeholder="Search memories or #tag…"
          placeholderTextColor={colors.ink3}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={{
            backgroundColor: colors.shade,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 15,
            color: colors.ink,
            minHeight: 44,
          }}
        />
      </View>

      {/* Suggestion chips */}
      {suggestionTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {suggestionTags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => handleTagChipPress(tag)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by tag ${tag}`}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 8,
                minHeight: 36,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: colors.ink2, fontWeight: "500" }}>
                #{tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* States */}
      {isIdle && (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{
              fontSize: 16,
              color: colors.ink3,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            {"Search by caption, note, or place.\nUse #tag to filter by tag."}
          </Text>
        </View>
      )}

      {!isIdle && isFetching && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {noResults && (
        <View className="flex-1 items-center justify-center px-8">
          <Text
            style={{
              fontSize: 16,
              color: colors.ink3,
              textAlign: "center",
            }}
          >
            {`No memories match "${trimmedQuery}"`}
          </Text>
        </View>
      )}

      {hasResults && (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: tabBarSpace }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}
