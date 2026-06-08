import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import { QueuedMemory } from "../../features/queue";
import { getUploadHandle } from "../../features/queue/queue-processor";
import { updateQueueStatus } from "../../features/queue/db";
import { refreshQueue } from "../../features/queue/use-upload-queue";
import { colors } from "../../lib/theme/tokens";

interface Props {
  item: QueuedMemory;
}

export const QueuedMemoryCard = React.memo(function QueuedMemoryCard({ item }: Props) {
  const progress = item.bytesTotal > 0
    ? (item.bytesUploaded / Math.max(item.bytesTotal, 1)) * 100
    : 0;

  const label =
    item.status === "failed"
      ? "Upload failed"
      : item.status === "uploading"
      ? `Uploading ${Math.round(progress)}%`
      : "Queued";

  function handlePress() {
    if (item.status !== "uploading" && item.status !== "queued") return;

    Alert.alert(
      "Cancel upload?",
      "The video upload will be cancelled and removed from the queue.",
      [
        { text: "Keep uploading", style: "cancel" },
        {
          text: "Cancel upload",
          style: "destructive",
          onPress: async () => {
            // Abort the in-flight XHR if the upload is active
            const handle = getUploadHandle(item.id);
            if (handle) {
              handle.abort();
            }
            // Mark the row as failed so the queue processor skips it on
            // the next drain and the UI removes it.
            await updateQueueStatus(item.id, "failed", "Cancelled by user");
            refreshQueue();
          },
        },
      ],
    );
  }

  return (
    <Pressable onPress={handlePress} accessibilityRole="button" accessibilityLabel="Cancel upload">
      <View style={styles.container}>
        {item.posterUri ? (
          <Image
            source={{ uri: item.posterUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={item.title ?? "Queued memory"}
          />
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.overlay}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` as `${number}%` },
              ]}
            />
          </View>
          <Text style={styles.label}>{label}</Text>
          {item.status === "failed" && item.error ? (
            <Text style={styles.errorText} numberOfLines={2}>
              {item.error}
            </Text>
          ) : null}
          {(item.status === "uploading" || item.status === "queued") ? (
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
  },
  image: {
    width: "100%",
    height: 200,
  },
  placeholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#cccccc",
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
