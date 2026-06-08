import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useVideoUrl } from "../../features/media";
import { useQueryClient } from "@tanstack/react-query";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: {
    id: string;
    couple_space_id: string;
    storage_key: string | null;
  };
}

/**
 * VideoPlayer — wraps expo-video fed by useVideoUrl (12h presigned GET, per I1 fix).
 *
 * Defense-in-depth refresh-on-403: if the player enters "error" status with a
 * message containing "403" or "Forbidden", we invalidate the video-url query so a
 * fresh presigned URL is fetched, then feed it to the player via replace().
 */
export function VideoPlayer({ memory }: Props) {
  const queryClient = useQueryClient();
  const { data: videoUrl, isLoading, isError } = useVideoUrl(memory);

  // Track the URL we last fed to the player to detect when a fresh one arrives.
  const currentUrlRef = useRef<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const player = useVideoPlayer(videoUrl ?? null, (p) => {
    p.loop = false;
  });

  // When a fresh URL arrives (after a 403-triggered invalidation), feed it in.
  useEffect(() => {
    if (!videoUrl) return;
    if (videoUrl === currentUrlRef.current) return;
    currentUrlRef.current = videoUrl;
    try {
      player.replace(videoUrl);
    } catch {
      // replace() may throw on some platforms if the player is not yet ready;
      // the initial URL was already passed to useVideoPlayer above.
    }
    setPlayerError(null);
  }, [videoUrl, player]);

  // Listen for error status to implement the refresh-on-403 defense.
  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("statusChange", (payload) => {
      if (payload.status !== "error") return;
      const message: string =
        payload.error?.message ?? "";
      if (message.includes("403") || message.toLowerCase().includes("forbidden")) {
        // Re-presign: invalidate React Query cache so useVideoUrl refetches.
        queryClient.invalidateQueries({
          queryKey: ["video-url", memory.id, memory.storage_key],
        });
      } else if (payload.status === "error") {
        setPlayerError("Could not play this video.");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, queryClient, memory.id, memory.storage_key]);

  if (!memory.storage_key) {
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          borderRadius: 12,
          backgroundColor: colors.surface2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.ink3, fontSize: 14 }}>No video attached</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          borderRadius: 12,
          backgroundColor: colors.surface2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError || playerError) {
    return (
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          borderRadius: 12,
          backgroundColor: colors.surface2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.ink3, fontSize: 14 }}>
          {playerError ?? "Could not load video."}
        </Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 12 }}
      allowsPictureInPicture
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
    />
  );
}
