import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";
import { File as EXFile } from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, getAppearance } from "../../lib/theme/tokens";

const mono = getAppearance() === "monochrome";
import { formatTimelineDate } from "../../lib/utils/date";
import { TagInput, type TagInputHandle } from "./tag-input";
import { LocationPicker } from "./location-picker";
import type { ResolvedPlace } from "../../features/places";

export type VideoSendPayload = {
  videoUri: string;
  mimeType: string;
  durationSeconds: number;
  sizeBytes: number;
  posterUri: string;
  title?: string;
  body?: string;
  dateHappened: string;
  tags: string[];
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

interface Props {
  spaceId: string | undefined;
  isPending?: boolean;
  uploadProgress?: number | null;
  onSend: (payload: VideoSendPayload) => void;
  onCancel: () => void;
  onAbort?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoComposer({
  spaceId,
  isPending,
  uploadProgress,
  onSend,
  onCancel,
  onAbort,
}: Props) {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("video/mp4");
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [sizeBytes, setSizeBytes] = useState<number>(0);
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [extractingPoster, setExtractingPoster] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dateHappened, setDateHappened] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [place, setPlace] = useState<ResolvedPlace | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const tagInputRef = useRef<TagInputHandle>(null);

  async function pickVideo() {
    setPickError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "videos",
        allowsEditing: false,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      });
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const mime = asset.mimeType ?? "video/mp4";

      // Duration: picker asset provides ms → convert to seconds
      const durMs = asset.duration ?? 0;
      const durSec = Math.round(durMs / 1000);

      // Size: use SDK-56 File object API
      let size = 0;
      try {
        const fileObj = new EXFile(uri);
        size = fileObj.size ?? 0;
      } catch {
        // size stays 0 → routing falls back to single-PUT (acceptable per I3)
      }

      setVideoUri(uri);
      setMimeType(mime);
      setDurationSeconds(durSec);
      setSizeBytes(size);

      // Extract poster frame
      setExtractingPoster(true);
      try {
        const thumb = await VideoThumbnails.getThumbnailAsync(uri, {
          time: Math.min(1000, durMs / 4),
          quality: 0.7,
        });
        setPosterUri(thumb.uri);
      } catch {
        // poster stays null; upload will still work, card just won't have a poster
      } finally {
        setExtractingPoster(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not open video library.";
      setPickError(msg);
    }
  }

  function handleSave() {
    if (!videoUri || !posterUri) return;
    const finalTags = tagInputRef.current?.flush() ?? tags;
    onSend({
      videoUri,
      mimeType,
      durationSeconds,
      sizeBytes,
      posterUri,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
      dateHappened,
      tags: finalTags,
      place_name: place?.place_name ?? null,
      latitude: place?.latitude ?? null,
      longitude: place?.longitude ?? null,
    });
  }

  const canSave = !!videoUri && !!posterUri && !extractingPoster && !isPending;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={isPending && onAbort ? onAbort : onCancel}
          hitSlop={12}
        >
          <Text style={styles.headerAction}>
            {isPending ? "abort" : "cancel"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>new video</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          hitSlop={12}
          style={styles.saveBtn}
        >
          <Text
            style={[
              styles.headerAction,
              styles.headerSave,
              !canSave && styles.saveDisabled,
            ]}
          >
            {isPending ? "saving..." : "save"}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formBody}>
            {/* Video / Poster picker */}
            <TouchableOpacity
              onPress={pickVideo}
              disabled={isPending}
              style={styles.mediaPicker}
              activeOpacity={0.75}
            >
              {posterUri ? (
                <View style={styles.posterWrapper}>
                  <Image
                    source={{ uri: posterUri }}
                    style={styles.posterImage}
                    resizeMode="cover"
                  />
                  {/* Duration badge */}
                  {durationSeconds > 0 && (
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>
                        {formatDuration(durationSeconds)}
                      </Text>
                    </View>
                  )}
                  {/* Play overlay */}
                  <View style={styles.playOverlay}>
                    <MaterialCommunityIcons
                      name="play-circle"
                      size={48}
                      color="rgba(255,255,255,0.85)"
                    />
                  </View>
                  {/* Tap to change */}
                  <View style={styles.changeHint}>
                    <Text style={styles.changeHintText}>tap to change</Text>
                  </View>
                </View>
              ) : extractingPoster ? (
                <View style={styles.mediaPlaceholder}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={styles.placeholderText}>
                    extracting preview…
                  </Text>
                </View>
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <MaterialCommunityIcons
                    name="video-plus"
                    size={40}
                    color={colors.ink3}
                  />
                  <Text style={styles.placeholderText}>
                    tap to choose a video
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {pickError && (
              <Text style={styles.errorText}>{pickError}</Text>
            )}

            {/* Upload progress */}
            {isPending && uploadProgress !== null && uploadProgress !== undefined && (
              <View style={styles.progressRow}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${uploadProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {uploadProgress < 100
                    ? `Uploading… ${uploadProgress}%`
                    : "Saving…"}
                </Text>
              </View>
            )}

            {/* Caption */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Caption{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="What happened?"
                placeholderTextColor={colors.ink3}
                value={title}
                onChangeText={setTitle}
                editable={!isPending}
              />
            </View>

            {/* Note */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Note{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Tell the story behind this memory…"
                placeholderTextColor={colors.ink3}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={body}
                onChangeText={setBody}
                editable={!isPending}
              />
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
                disabled={isPending}
              >
                <Text style={styles.inputText}>
                  {formatTimelineDate(dateHappened)}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(dateHappened + "T00:00:00")}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setDateHappened(
                        selectedDate.toISOString().slice(0, 10)
                      );
                    }
                  }}
                />
              )}
            </View>

            {/* Tags */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Tags{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TagInput
                ref={tagInputRef}
                value={tags}
                onChange={setTags}
              />
            </View>

            {/* Place */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Place{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <LocationPicker spaceId={spaceId} value={place} onChange={setPlace} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink4 + "44",
  },
  headerAction: {
    fontSize: 16,
    color: colors.ink2,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: mono ? undefined : "CormorantInfant_600SemiBold",
    color: colors.ink,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSave: {
    fontWeight: "600",
    color: colors.accent,
  },
  saveDisabled: {
    color: colors.ink3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  mediaPicker: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  mediaPlaceholder: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.ink4,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.shade,
  },
  placeholderText: {
    color: colors.ink3,
    fontSize: 14,
  },
  posterWrapper: {
    position: "relative",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  changeHint: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.50)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  changeHintText: {
    color: "#fff",
    fontSize: 11,
  },
  progressRow: {
    gap: 6,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.shade,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.ink3,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: -8,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink2,
  },
  optional: {
    fontWeight: "400",
    color: colors.ink3,
  },
  input: {
    backgroundColor: colors.shade,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.ink,
    fontSize: 16,
    justifyContent: "center",
  },
  inputText: {
    color: colors.ink,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 14,
  },
});
