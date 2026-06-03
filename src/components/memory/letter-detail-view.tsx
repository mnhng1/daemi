import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { MemoryWithAuthor } from "../../types/database";
import { useToggleReaction, useDeleteMemory } from "../../features/memories";
import { useSession } from "../../features/auth/session-provider";
import { formatLetterDate } from "../../lib/utils/date";
import { wordCount } from "../../lib/utils/text";
import { errorMessage, logError } from "../../lib/utils/log";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export function LetterDetailView({ memory }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const toggleReaction = useToggleReaction(memory.id);
  const deleteMemory = useDeleteMemory();
  const authorName = memory.author?.display_name?.toUpperCase() ?? "UNKNOWN";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.letterPaper }}>
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

        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: colors.accent, fontSize: 16, marginRight: 8 }}>✎</Text>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5 }}>
              LETTER FROM {authorName}
            </Text>
          </View>

          {memory.title && (
            <Text style={{ color: colors.ink, fontSize: 24, fontFamily: "CormorantInfant_600SemiBold", marginBottom: 8 }}>
              {memory.title}
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>{formatLetterDate(memory.date_happened)}</Text>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>·</Text>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>{wordCount(memory.body)} words</Text>
          </View>
        </View>

        <View style={{ width: 48, height: 2, backgroundColor: colors.accent, marginBottom: 32 }} />

        <Text
          style={{
            fontFamily: "CormorantInfant_400Regular_Italic",
            fontStyle: "italic",
            color: colors.ink,
            fontSize: 18,
            lineHeight: 32,
          }}
          accessibilityRole="text"
        >
          {memory.body}
        </Text>

        {partnerHearted && (
          <Text style={{ color: colors.accent, fontSize: 13, marginTop: 24 }}>
            Your partner hearted this
          </Text>
        )}

        <View style={{ marginTop: 48, alignItems: "center" }}>
          <View style={{ width: 32, height: 2, backgroundColor: colors.ink4, marginBottom: 16 }} />
          <Text style={{ color: colors.ink3, fontSize: 12, fontStyle: "italic" }}>Written with love</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
