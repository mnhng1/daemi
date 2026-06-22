import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { useToggleReaction, useDeleteMemory } from "../../features/memories";
import { useSession } from "../../features/auth/session-provider";
import { useCollections } from "../../features/collections/use-collections";
import { CollectionPickerSheet } from "../collections/collection-picker-sheet";
import { formatTimelineDate } from "../../lib/utils/date";
import { errorMessage, logError } from "../../lib/utils/log";
import { colors, getAppearance } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export function TicketDetailView({ memory }: Props) {
  const mono = getAppearance() === "monochrome";
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: stubPhotoUrl } = useMediaUrl(memory);
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const toggleReaction = useToggleReaction(memory.id);
  const deleteMemory = useDeleteMemory();
  const isAuthor = memory.created_by_user_id === userId;
  const [pickerVisible, setPickerVisible] = useState(false);
  const { data: collections } = useCollections(memory.couple_space_id);
  const currentCollection = collections?.find((c) => c.id === memory.collection_id) ?? null;
  // Drive the chip's state off collection_id (known immediately) so an assigned
  // memory doesn't flash "Add to collection" while the collections query loads.
  const inACollection = memory.collection_id !== null;
  const collectionLabel = currentCollection
    ? `In: ${currentCollection.name}`
    : inACollection
      ? "In a collection"
      : "Add to collection";

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

  const hasReacted = memory.reactions.some((r) => r.user_id === userId);
  const partnerHearted = memory.reactions.some((r) => r.user_id !== userId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        {/* Header: back button on left, actions (heart + author controls) on right */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
          >
            <Text style={{ fontSize: 24, color: colors.ink }}>←</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {/* Heart toggle — always visible */}
            <Pressable
              onPress={() => toggleReaction.mutate()}
              disabled={toggleReaction.isPending}
              accessibilityRole="button"
              accessibilityLabel={hasReacted ? "Remove heart reaction" : "Add heart reaction"}
              accessibilityState={{ selected: hasReacted }}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 22, opacity: toggleReaction.isPending ? 0.5 : 1 }}>
                {hasReacted ? "❤️" : "🤍"}
              </Text>
            </Pressable>

            {/* Edit and Delete — author only */}
            {isAuthor && (
              <>
                <TouchableOpacity
                  onPress={() => router.push(`/memory/${memory.id}/edit`)}
                  accessibilityRole="button"
                  accessibilityLabel="Edit memory"
                  hitSlop={12}
                  style={{ paddingHorizontal: 8, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 15, color: colors.accent }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleteMemory.isPending}
                  accessibilityRole="button"
                  accessibilityLabel="Delete memory"
                  accessibilityState={{ disabled: deleteMemory.isPending }}
                  hitSlop={12}
                  style={{ paddingHorizontal: 8, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 15, color: colors.ink3, opacity: deleteMemory.isPending ? 0.4 : 1 }}>
                    {deleteMemory.isPending ? "Deleting…" : "Delete"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Big ticket card — slight rotation for personality (scrapbook only) */}
        <View style={{ marginTop: 24, transform: [{ rotate: mono ? "0deg" : "-1deg" }] }}>
          <View
            style={{
              flexDirection: "row",
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: colors.surface,
              borderWidth: mono ? 0 : 1,
              borderColor: colors.ink4,
              minHeight: 110,
              ...(mono ? {} : {
                shadowColor: colors.ink,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }),
            }}
          >
            {/* Left stub-photo panel */}
            <View style={{ width: 130, flexShrink: 0 }}>
              {stubPhotoUrl ? (
                <Image
                  source={{ uri: stubPhotoUrl }}
                  style={{ width: 130, height: "100%" }}
                  resizeMode="cover"
                  accessibilityLabel="Ticket stub photo"
                />
              ) : (
                <View style={{ width: 130, height: "100%", backgroundColor: colors.shade }} />
              )}
            </View>

            {/* Perforation — scrapbook only */}
            {!mono && (
              <View style={{ position: "relative", width: 0 }}>
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: -0.5,
                    borderLeftWidth: 1.5,
                    borderLeftColor: colors.ink4,
                    borderStyle: "dashed",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: -7,
                    left: -7,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.paper,
                    borderWidth: 1,
                    borderColor: colors.ink4,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -7,
                    left: -7,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.paper,
                    borderWidth: 1,
                    borderColor: colors.ink4,
                  }}
                />
              </View>
            )}

            {/* Right content panel */}
            <View
              style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingVertical: 14,
                justifyContent: "center",
                minWidth: 0,
              }}
            >
              {/* "ADMIT ONE" label */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <Text style={{ fontSize: 13 }}>🎟</Text>
                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: "700",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: colors.ink3,
                  }}
                >
                  admit one
                </Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 23,
                  fontWeight: "700",
                  color: colors.ink,
                  lineHeight: 24,
                }}
                numberOfLines={2}
              >
                {memory.title ?? "Untitled"}
              </Text>

              {/* Subtitle: place or formatted date */}
              <Text
                style={{ fontSize: 11.5, color: colors.ink2, marginTop: 3 }}
                numberOfLines={1}
              >
                {memory.place_name ?? formatTimelineDate(memory.date_happened)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stub photo — full width, shown when storage_key is set */}
        {stubPhotoUrl && (
          <View style={{ marginTop: 16 }}>
            <Image
              source={{ uri: stubPhotoUrl }}
              style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 14 }}
              resizeMode="cover"
              accessibilityLabel="Stub photo"
            />
          </View>
        )}

        {/* Note — sticky-note style (scrapbook) / plain text (mono) */}
        {memory.body ? (
          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 6,
              backgroundColor: mono ? colors.surface : colors.highlight,
              transform: [{ rotate: mono ? "0deg" : "0.6deg" }],
              ...(mono ? {} : {
                shadowColor: colors.ink,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 2,
              }),
            }}
          >
            <Text
              style={{
                fontFamily: mono ? undefined : "CormorantInfant_400Regular_Italic",
                fontStyle: mono ? undefined : "italic",
                fontSize: 17,
                color: colors.ink,
                lineHeight: 26,
              }}
            >
              {memory.body}
            </Text>
          </View>
        ) : null}

        {/* Date line */}
        <Text style={{ color: colors.ink3, fontSize: 14, marginTop: 16 }}>
          {formatTimelineDate(memory.date_happened)}
        </Text>

        {partnerHearted && (
          <Text style={{ color: colors.accent, fontSize: 13, marginTop: 12 }}>
            Your partner hearted this
          </Text>
        )}

        {/* Collection chip */}
        <Pressable
          onPress={() => setPickerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={
            inACollection
              ? `${collectionLabel}. Tap to change.`
              : "Add to collection"
          }
          style={{
            marginTop: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: inACollection ? colors.accent : colors.ink4,
            backgroundColor: inACollection ? colors.accentSoft : colors.surface,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: inACollection ? colors.accent : colors.ink3,
              fontWeight: inACollection ? "600" : "400",
            }}
          >
            {collectionLabel}
          </Text>
        </Pressable>
      </ScrollView>

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
