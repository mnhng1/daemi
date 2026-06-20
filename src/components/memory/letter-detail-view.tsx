import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
  LayoutChangeEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MemoryWithAuthor } from "../../types/database";
import { useToggleReaction, useDeleteMemory } from "../../features/memories";
import { useSession } from "../../features/auth/session-provider";
import { useCollections } from "../../features/collections/use-collections";
import { CollectionPickerSheet } from "../collections/collection-picker-sheet";
import { MetaPill } from "../ui/meta-pill";
import { formatLetterDate } from "../../lib/utils/date";
import { wordCount } from "../../lib/utils/text";
import { errorMessage, logError } from "../../lib/utils/log";
import { colors, fonts } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

// Ruled-paper geometry — body line-height equals the ruling spacing so the
// handwriting sits on the lines (mirrors the prototype's 30px repeating rule).
const LINE_HEIGHT = 32;
// Push the first text row's baseline down onto the first ruled line. Without
// this the text floats above the lines (see letter-composer for the geometry).
const BODY_PAD_TOP = Math.round(LINE_HEIGHT * 0.2);

export function LetterDetailView({ memory }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const toggleReaction = useToggleReaction(memory.id);
  const deleteMemory = useDeleteMemory();
  const authorName = memory.author?.display_name ?? "Unknown";
  const isAuthor = memory.created_by_user_id === userId;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  // Height of the rendered body, used to compute how many ruled lines to draw.
  const [bodyHeight, setBodyHeight] = useState(0);
  const { data: collections } = useCollections(memory.couple_space_id);
  const currentCollection = collections?.find((c) => c.id === memory.collection_id) ?? null;
  // Drive the collection pill off collection_id (known immediately) so an assigned
  // memory doesn't flash "Add to collection" while the collections query loads.
  const inACollection = memory.collection_id !== null;
  const collectionLabel = currentCollection
    ? currentCollection.name
    : inACollection
      ? "In a collection"
      : "Add to collection";

  const hasReacted = memory.reactions.some((r) => r.user_id === userId);
  const tags = memory.tags ?? [];
  const hasMeta = !!memory.place_name || inACollection;

  function handleDelete() {
    Alert.alert(
      "Delete memory",
      "This memory will be removed from your timeline. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMemory.mutateAsync(memory.id);
            } catch (err) {
              logError("delete-memory:handleDelete", err);
              Alert.alert(
                "Error",
                __DEV__
                  ? `Could not delete this memory.\n\n${errorMessage(err)}`
                  : "Could not delete this memory. Please try again."
              );
              return;
            }
            queryClient.removeQueries({ queryKey: ["memories", "detail", memory.id] });
            router.back();
            queryClient.invalidateQueries({ queryKey: ["memories"] });
          },
        },
      ]
    );
  }

  function onBodyLayout(e: LayoutChangeEvent) {
    setBodyHeight(e.nativeEvent.layout.height);
  }

  // One ruled line per body line, plus a couple extra so the paper feels lined
  // even past the last word.
  const lineCount = Math.ceil(bodyHeight / LINE_HEIGHT) + 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.letterPaper }} edges={["top", "bottom"]}>
      {/* Header — back · centered date + author · "…" menu (prototype DetailChrome) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {formatLetterDate(memory.date_happened)}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            letter from {authorName}
          </Text>
        </View>

        {/* Overflow menu — author only (non-authors have no edit/delete) */}
        {isAuthor ? (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Memory actions"
            hitSlop={12}
            style={styles.headerBtn}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.ink} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32 }}>
        {memory.title && <Text style={styles.title}>{memory.title}</Text>}

        {/* Ruled letter body — handwriting sitting on reference lines */}
        <View style={{ position: "relative" }}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: lineCount }).map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: LINE_HEIGHT * (i + 1),
                  height: StyleSheet.hairlineWidth,
                  backgroundColor: colors.ink4,
                  opacity: 0.7,
                }}
              />
            ))}
          </View>

          <Text
            onLayout={onBodyLayout}
            style={{
              fontFamily: fonts.hand,
              color: colors.ink,
              fontSize: 21,
              lineHeight: LINE_HEIGHT,
              paddingTop: BODY_PAD_TOP,
            }}
            accessibilityRole="text"
          >
            {memory.body}
          </Text>
        </View>

        {/* Signature — sealed line (prototype) */}
        <Text style={styles.sealed}>
          sealed {formatLetterDate(memory.date_happened)} · {wordCount(memory.body)} words
        </Text>
      </ScrollView>

      {/* Sticky footer — place / collection / tags + heart (prototype DetailFoot) */}
      <View style={styles.footer}>
        {hasMeta && (
          <View style={styles.metaRow}>
            {memory.place_name && (
              <MetaPill icon="location-outline" label={memory.place_name} />
            )}
            <MetaPill
              icon="folder-outline"
              label={collectionLabel}
              accent={inACollection}
              onPress={() => setPickerVisible(true)}
              accessibilityLabel={
                inACollection ? `${collectionLabel}. Tap to change.` : "Add to collection"
              }
            />
          </View>
        )}

        <View style={styles.actionRow}>
          {tags.map((t) => (
            <Text key={t} style={styles.tag}>
              #{t}
            </Text>
          ))}
          {/* When there's no meta row, expose collection assignment here too. */}
          {!hasMeta && (
            <MetaPill
              icon="folder-outline"
              label={collectionLabel}
              onPress={() => setPickerVisible(true)}
              accessibilityLabel="Add to collection"
            />
          )}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => toggleReaction.mutate()}
            disabled={toggleReaction.isPending}
            accessibilityRole="button"
            accessibilityLabel={hasReacted ? "Remove heart reaction" : "Add heart reaction"}
            accessibilityState={{ selected: hasReacted }}
            hitSlop={8}
            style={{ padding: 4, opacity: toggleReaction.isPending ? 0.5 : 1 }}
          >
            <Ionicons
              name={hasReacted ? "heart" : "heart-outline"}
              size={22}
              color={colors.accent}
            />
          </Pressable>
        </View>
      </View>

      {/* "…" action menu — author-only Edit + Delete (heart lives in the footer) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            <MenuItem
              label="Edit"
              icon="create-outline"
              onPress={() => {
                setMenuVisible(false);
                router.push(`/memory/${memory.id}/edit`);
              }}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              label={deleteMemory.isPending ? "Deleting…" : "Delete"}
              icon="trash-outline"
              destructive
              disabled={deleteMemory.isPending}
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <CollectionPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        coupleSpaceId={memory.couple_space_id}
        memoryId={memory.id}
        currentCollectionId={memory.collection_id}
      />
    </SafeAreaView>
  );
}

function MenuItem({
  label,
  icon,
  onPress,
  destructive,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const color = destructive ? colors.destructive : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.menuItem, disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={icon} size={18} color={color} style={{ width: 22 }} />
      <Text style={[styles.menuItemLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink4,
    backgroundColor: colors.paper,
  },
  headerBtn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 22,
  },
  headerSub: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 24,
    fontFamily: "CormorantInfant_600SemiBold",
    marginBottom: 12,
  },
  sealed: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.ink3,
    textAlign: "right",
    marginTop: 22,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.ink4,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 9,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.ink2,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(12,8,6,0.25)",
  },
  menuCard: {
    position: "absolute",
    top: 96,
    right: 12,
    minWidth: 168,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink4,
    paddingVertical: 4,
    shadowColor: "#46301c",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemLabel: {
    fontSize: 15,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.ink4,
    marginHorizontal: 16,
  },
});
