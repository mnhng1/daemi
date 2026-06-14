import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useOnlineStatus } from "../../features/network";
import { useUploadQueue, refreshQueue } from "../../features/queue";
import { triggerDrain } from "../../features/queue/queue-processor";
import { colors } from "../../lib/theme/tokens";

interface Props {
  spaceId: string | undefined;
}

export function OfflineBanner({ spaceId }: Props) {
  const online = useOnlineStatus();
  const { queued } = useUploadQueue(spaceId);

  const pendingCount = queued.length;

  // online===null means still fetching connectivity; treat as online to avoid
  // a false-positive offline flash on cold launch.
  const isOffline = online === false;

  // Show when definitively offline, or when online but there are pending items
  const shouldShow = isOffline || pendingCount > 0;
  if (!shouldShow) return null;

  function handleRetry() {
    refreshQueue();
    triggerDrain();
  }

  const message = !isOffline
    ? `${pendingCount} ${pendingCount === 1 ? "memory" : "memories"} waiting to sync`
    : pendingCount > 0
    ? `You're offline — ${pendingCount} ${pendingCount === 1 ? "memory" : "memories"} will sync when you're back`
    : "You're offline";

  return (
    <View style={styles.banner}>
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      {!isOffline && pendingCount > 0 ? (
        <Pressable onPress={handleRetry} style={styles.retryButton} accessibilityRole="button">
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.highlight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  message: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  retryText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
});
