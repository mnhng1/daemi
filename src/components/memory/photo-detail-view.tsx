import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MemoryWithAuthor } from "../../types/database";
import { useMediaUrl } from "../../features/media";
import { useToggleReaction, useDeleteMemory } from "../../features/memories";
import { useSession } from "../../features/auth/session-provider";
import { formatTimelineDate } from "../../lib/utils/date";
import { errorMessage, logError } from "../../lib/utils/log";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export function PhotoDetailView({ memory }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: mediaUrl } = useMediaUrl(memory);
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const toggleReaction = useToggleReaction(memory.id);
  const deleteMemory = useDeleteMemory();
  const isAuthor = memory.created_by_user_id === userId;

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

          {partnerHearted && (
            <Text style={{ color: colors.accent, fontSize: 13, marginTop: 12 }}>
              Your partner hearted this
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
