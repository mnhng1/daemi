import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession, useCurrentUser } from "../../../src/features/auth";
import { useCurrentCoupleSpace, usePartner } from "../../../src/features/couple-space";
import { useCreateMemory } from "../../../src/features/memories";
import { useSpaceTags } from "../../../src/features/search";
import { formatTimelineDate } from "../../../src/lib/utils/date";
import { wordCount } from "../../../src/lib/utils/text";
import { colors } from "../../../src/lib/theme/tokens";
import { MemoryTypePicker } from "../../../src/components/add-memory/memory-type-picker";
import { LetterComposer } from "../../../src/components/add-memory/letter-composer";
import { VideoComposer, type VideoSendPayload } from "../../../src/components/add-memory/video-composer";
import { TicketComposer, type TicketSendPayload } from "../../../src/components/add-memory/ticket-composer";
import { TagInput, type TagInputHandle } from "../../../src/components/add-memory/tag-input";
import { LocationPicker } from "../../../src/components/add-memory/location-picker";
import type { ResolvedPlace } from "../../../src/features/places";

const schema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  dateHappened: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function Add() {
  const router = useRouter();
  const { session } = useSession();
  const { data: coupleSpaceData } = useCurrentCoupleSpace();
  const { data: currentUser } = useCurrentUser();
  const { data: partnerName } = usePartner();
  const createMemory = useCreateMemory();

  const spaceId = coupleSpaceData?.couple_spaces?.id;
  const { data: spaceTags } = useSpaceTags(spaceId);

  const [selectedType, setSelectedType] = useState<"photo" | "video" | "letter" | "ticket" | null>(null);
  // Bumped on every focus so the type picker remounts and replays its entrance
  // animation while the Add tab is actually visible (see useFocusEffect below).
  const [focusKey, setFocusKey] = useState(0);
  const [image, setImage] = useState<{ uri: string; mimeType: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [letterBody, setLetterBody] = useState("");
  const [letterError, setLetterError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [place, setPlace] = useState<ResolvedPlace | null>(null);
  const tagInputRef = useRef<TagInputHandle>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      dateHappened: new Date().toISOString().slice(0, 10),
    },
  });

  const dateHappened = watch("dateHappened");

  useFocusEffect(
    useCallback(() => {
      // Arriving at the Add tab always starts fresh on the type picker. Tab
      // screens stay mounted (and react-native-screens detaches inactive ones),
      // so resetting only on blur could leave the picker mounted off-screen with
      // its entrance animation already spent — the screen then reads as blank on
      // return. Reset on focus and bump focusKey to remount the picker so its
      // entrance animation replays while visible. The native media picker does
      // not fire navigation focus/blur, so an in-progress compose is preserved.
      setSelectedType(null);
      reset();
      setImage(null);
      setImageError(null);
      setShowDatePicker(false);
      setUploadProgress(null);
      setLetterBody("");
      setLetterError(null);
      setTags([]);
      setPlace(null);
      createMemory.reset();
      setFocusKey((k) => k + 1);
      return () => {
        setSelectedType(null);
      };
    }, [reset, createMemory.reset])
  );

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType ?? "image/jpeg",
      });
      setImageError(null);
    }
  }

  function resetForm() {
    setUploadProgress(null);
    reset();
    setImage(null);
    setLetterBody("");
    setLetterError(null);
    setTags([]);
    setPlace(null);
    setSelectedType(null);
    router.replace("/(tabs)/timeline");
  }

  function onSubmit(data: FormData) {
    const coupleSpaceId = coupleSpaceData?.couple_spaces?.id;
    if (!coupleSpaceId || !session?.user.id) {
      if (selectedType === "letter") {
        setLetterError("Unable to save. Please sign in and try again.");
      } else {
        setImageError("Unable to save. Please sign in and try again.");
      }
      return;
    }

    if (selectedType === "letter") {
      if (!letterBody.trim()) {
        setLetterError("Write something before saving.");
        return;
      }
      setLetterError(null);
      createMemory.mutate(
        {
          type: "letter",
          coupleSpaceId,
          userId: session.user.id,
          title: data.title || undefined,
          body: letterBody,
          dateHappened: data.dateHappened,
          place_name: place?.place_name ?? null,
          latitude: place?.latitude ?? null,
          longitude: place?.longitude ?? null,
        },
        { onSuccess: resetForm, onError: () => setUploadProgress(null) }
      );
    } else {
      if (!image) {
        setImageError("Pick a photo to save this memory.");
        return;
      }
      const finalTags = tagInputRef.current?.flush() ?? tags;
      createMemory.mutate(
        {
          type: "photo",
          coupleSpaceId,
          userId: session.user.id,
          imageUri: image.uri,
          mimeType: image.mimeType,
          title: data.title || undefined,
          body: data.body || undefined,
          dateHappened: data.dateHappened,
          tags: finalTags,
          place_name: place?.place_name ?? null,
          latitude: place?.latitude ?? null,
          longitude: place?.longitude ?? null,
          onProgress: setUploadProgress,
        },
        { onSuccess: resetForm, onError: () => setUploadProgress(null) }
      );
    }
  }

  function handleLetterSend(body: string) {
    const coupleSpaceId = coupleSpaceData?.couple_spaces?.id;
    if (!coupleSpaceId || !session?.user.id) {
      setLetterError("Unable to save. Please sign in and try again.");
      return;
    }
    if (!body.trim()) {
      setLetterError("Write something before sending.");
      return;
    }
    setLetterError(null);
    createMemory.mutate(
      {
        type: "letter",
        coupleSpaceId,
        userId: session.user.id,
        body,
        dateHappened: new Date().toISOString().slice(0, 10),
        place_name: place?.place_name ?? null,
        latitude: place?.latitude ?? null,
        longitude: place?.longitude ?? null,
      },
      { onSuccess: resetForm }
    );
  }

  function handleVideoSend(payload: VideoSendPayload) {
    const coupleSpaceId = coupleSpaceData?.couple_spaces?.id;
    if (!coupleSpaceId || !session?.user.id) return;
    createMemory.mutate(
      {
        type: "video",
        coupleSpaceId,
        userId: session.user.id,
        videoUri: payload.videoUri,
        mimeType: payload.mimeType,
        durationSeconds: payload.durationSeconds,
        sizeBytes: payload.sizeBytes,
        posterUri: payload.posterUri,
        title: payload.title,
        body: payload.body,
        dateHappened: payload.dateHappened,
        tags: payload.tags,
        place_name: payload.place_name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        onProgress: setUploadProgress,
      },
      { onSuccess: resetForm, onError: () => setUploadProgress(null) }
    );
  }

  function handleTicketSend(payload: TicketSendPayload) {
    const coupleSpaceId = coupleSpaceData?.couple_spaces?.id;
    if (!coupleSpaceId || !session?.user.id) return;
    createMemory.mutate(
      {
        type: "ticket",
        coupleSpaceId,
        userId: session.user.id,
        title: payload.title,
        body: payload.body,
        imageUri: payload.imageUri,
        mimeType: payload.mimeType,
        dateHappened: payload.dateHappened,
        tags: payload.tags,
        place_name: payload.place_name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        onProgress: setUploadProgress,
      },
      { onSuccess: resetForm, onError: () => setUploadProgress(null) }
    );
  }

  if (!selectedType) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.shade }} edges={["top"]}>
        <MemoryTypePicker
          key={focusKey}
          onSelect={setSelectedType}
          onDismiss={() => router.replace("/(tabs)/timeline")}
        />
      </SafeAreaView>
    );
  }

  if (selectedType === "letter") {
    return (
      <LetterComposer
        partnerName={partnerName ?? null}
        authorName={currentUser?.display_name ?? null}
        isPending={createMemory.isPending}
        onSend={handleLetterSend}
        onCancel={() => setSelectedType(null)}
      />
    );
  }

  if (selectedType === "video") {
    return (
      <VideoComposer
        spaceId={spaceId}
        isPending={createMemory.isPending}
        uploadProgress={uploadProgress}
        onSend={handleVideoSend}
        onCancel={() => setSelectedType(null)}
        onAbort={() => {
          createMemory.abort();
          createMemory.reset();
          setUploadProgress(null);
          setSelectedType(null);
        }}
      />
    );
  }

  if (selectedType === "ticket") {
    return (
      <TicketComposer
        spaceId={spaceId}
        isPending={createMemory.isPending}
        onSend={handleTicketSend}
        onCancel={() => setSelectedType(null)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-6">
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => setSelectedType(null)}
                style={{ marginRight: 12 }}
              >
                <Text style={{ fontSize: 22, color: colors.ink }}>←</Text>
              </TouchableOpacity>
              <Text className="text-ink font-bold text-xl">New Photo</Text>
            </View>

            {selectedType === "photo" && (
              <>
                <TouchableOpacity onPress={pickImage} className="mb-4">
                  {image ? (
                    <Image
                      source={{ uri: image.uri }}
                      className="w-full h-64 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-64 rounded-xl border-2 border-dashed border-ink-4 items-center justify-center">
                      <Text className="text-ink-3 text-base">Tap to choose a photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {imageError && (
                  <Text className="text-red-500 text-xs mb-2">{imageError}</Text>
                )}

                <View className="mb-4">
                  <Text className="text-ink-2 text-sm mb-1.5 font-medium">
                    Caption <Text className="text-ink-3 font-normal">(optional)</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                        placeholder="A short caption"
                        placeholderTextColor={colors.ink3}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-ink-2 text-sm mb-1.5 font-medium">
                    Note <Text className="text-ink-3 font-normal">(optional)</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="body"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                        placeholder="Tell the story behind this memory..."
                        placeholderTextColor={colors.ink3}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 100 }}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-ink-2 text-sm mb-1.5 font-medium">
                    Tags <Text className="text-ink-3 font-normal">(optional)</Text>
                  </Text>
                  <TagInput
                    ref={tagInputRef}
                    value={tags}
                    onChange={setTags}
                    suggestions={spaceTags}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-ink-2 text-sm mb-1.5 font-medium">
                    Place <Text className="text-ink-3 font-normal">(optional)</Text>
                  </Text>
                  <LocationPicker spaceId={spaceId} value={place} onChange={setPlace} />
                </View>
              </>
            )}

            <View className="mb-6">
              <Text className="text-ink-2 text-sm mb-1.5 font-medium">Date</Text>
              <TouchableOpacity
                className="bg-shade rounded-xl px-4 py-3.5"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-ink text-base">
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
                      setValue("dateHappened", selectedDate.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              className={`bg-accent rounded-xl py-3.5 items-center ${createMemory.isPending ? "opacity-50" : ""}`}
              onPress={handleSubmit(onSubmit)}
              disabled={createMemory.isPending}
            >
              {createMemory.isPending ? (
                <Text className="text-white font-semibold text-base">
                  {uploadProgress !== null && uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : "Saving..."}
                </Text>
              ) : (
                <Text className="text-white font-semibold text-base">Save Memory</Text>
              )}
            </TouchableOpacity>

            {createMemory.isError && (
              <Text className="text-red-500 text-sm text-center mt-3">
                {createMemory.error?.message ?? "Something went wrong"}
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
