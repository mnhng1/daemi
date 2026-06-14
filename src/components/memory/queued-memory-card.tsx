import React from "react";
import { View, Text, Image, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { QueuedMemory } from "../../features/queue";
import { getUploadHandle, triggerDrain } from "../../features/queue/queue-processor";
import { deleteQueueRow, updateQueueStatus, resetQueueRow } from "../../features/queue/db";
import { refreshQueue } from "../../features/queue/use-upload-queue";
import { colors } from "../../lib/theme/tokens";

interface Props {
  item: QueuedMemory;
}

export const QueuedMemoryCard = React.memo(function QueuedMemoryCard({ item }: Props) {
  // Video rows track bytes; other types report percent via onProgress but
  // bytesTotal stays 0 — show indeterminate spinner instead of a stuck bar.
  const isVideo = item.type === "video";
  const hasByteProgress = isVideo && item.bytesTotal > 0;
  const progress = hasByteProgress
    ? (item.bytesUploaded / Math.max(item.bytesTotal, 1)) * 100
    : 0;

  const label =
    item.status === "failed"
      ? "Upload failed"
      : item.status === "uploading"
      ? isVideo && hasByteProgress
        ? `Uploading ${Math.round(progress)}%`
        : "Uploading…"
      : "Queued";

  // Never-uploaded draft: no bytes transferred, no active handle.
  // These can be deleted outright rather than going through failed state.
  const isNeverUploaded = item.bytesUploaded === 0 && item.bytesTotal === 0;

  async function handleDeleteDraft() {
    await deleteQueueRow(item.id);
    refreshQueue();
  }

  async function handleRetryFailed() {
    await resetQueueRow(item.id);
    refreshQueue();
    triggerDrain();
  }

  function handlePress() {
    if (item.status === "failed") {
      Alert.alert(
        "Upload failed",
        item.error ?? "The upload could not complete.",
        [
          { text: "Dismiss", style: "cancel" },
          {
            text: "Retry",
            onPress: handleRetryFailed,
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: handleDeleteDraft,
          },
        ],
      );
      return;
    }

    if (item.status !== "uploading" && item.status !== "queued") return;

    // For never-uploaded drafts (offline creates) offer outright delete.
    // For in-progress uploads offer cancel → failed.
    if (isNeverUploaded && item.status === "queued") {
      Alert.alert(
        "Remove draft?",
        "This memory hasn't been uploaded yet. Remove it from the queue?",
        [
          { text: "Keep", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: handleDeleteDraft,
          },
        ],
      );
    } else {
      Alert.alert(
        "Cancel upload?",
        "This upload will be cancelled and removed from the queue.",
        [
          { text: "Keep uploading", style: "cancel" },
          {
            text: "Cancel upload",
            style: "destructive",
            onPress: async () => {
              const handle = getUploadHandle(item.id);
              if (handle) {
                handle.abort();
              }
              await updateQueueStatus(item.id, "failed", "Cancelled by user");
              refreshQueue();
            },
          },
        ],
      );
    }
  }

  // Determine the thumbnail URI: posterUri for video/photo, localMediaUri as
  // fallback for ticket. Letter has no image.
  const imageUri = item.posterUri ?? (item.type !== "letter" ? item.localMediaUri : null);

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel={item.status === "failed" ? "Retry or delete upload" : "Cancel upload"}>
      <View style={styles.container}>
        {/* Media area */}
        {item.type === "letter" ? (
          <View style={[styles.placeholder, styles.letterPlaceholder]}>
            <Text style={styles.letterIcon}>✉</Text>
            {item.body ? (
              <Text style={styles.letterSnippet} numberOfLines={3}>
                {item.body}
              </Text>
            ) : null}
          </View>
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={item.title ?? "Queued memory"}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Progress indicator */}
          {item.status === "uploading" && (
            hasByteProgress ? (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` as `${number}%` },
                  ]}
                />
              </View>
            ) : (
              <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
            )
          )}

          <Text style={styles.label}>{label}</Text>
          {item.status === "failed" && item.error ? (
            <Text style={styles.errorText} numberOfLines={2}>
              {item.error}
            </Text>
          ) : null}
          {item.status === "failed" ? (
            <Text style={styles.tapHint}>Tap to retry or delete</Text>
          ) : item.status === "uploading" || item.status === "queued" ? (
            <Text style={styles.tapHint}>Tap to cancel</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    opacity: 0.75,
  },
  image: {
    width: "100%",
    height: 200,
  },
  placeholder: {
    width: "100%",
    height: 200,
    backgroundColor: colors.shade,
  },
  letterPlaceholder: {
    backgroundColor: colors.letterPaper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  letterIcon: {
    fontSize: 36,
    opacity: 0.5,
  },
  letterSnippet: {
    color: colors.ink2,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontStyle: "italic",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  spinner: {
    alignSelf: "flex-start",
  },
  label: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    color: "#ffaaaa",
    fontSize: 11,
  },
  tapHint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
  },
});
