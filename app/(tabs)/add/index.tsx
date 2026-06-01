import { useState, useCallback } from "react";
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
import { useSession } from "../../../src/features/auth";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";
import { useCreateMemory } from "../../../src/features/memories";
import { formatTimelineDate } from "../../../src/lib/utils/date";
import { colors } from "../../../src/lib/theme/tokens";

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
  const createMemory = useCreateMemory();

  const [image, setImage] = useState<{ uri: string; mimeType: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
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
      return () => {
        reset();
        setImage(null);
        setImageError(null);
        setShowDatePicker(false);
        setUploadProgress(null);
        createMemory.reset();
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

  function onSubmit(data: FormData) {
    if (!image) {
      setImageError("Pick a photo to save this memory.");
      return;
    }
    const coupleSpaceId = coupleSpaceData?.couple_spaces?.id;
    if (!coupleSpaceId || !session?.user.id) {
      setImageError("Unable to save. Please sign in and try again.");
      return;
    }

    createMemory.mutate(
      {
        coupleSpaceId,
        userId: session.user.id,
        imageUri: image.uri,
        mimeType: image.mimeType,
        title: data.title || undefined,
        body: data.body || undefined,
        dateHappened: data.dateHappened,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setUploadProgress(null);
          reset();
          setImage(null);
          router.replace("/(tabs)/timeline");
        },
        onError: () => {
          setUploadProgress(null);
        },
      }
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
            <Text className="text-ink font-bold text-xl mb-6">New Photo</Text>

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
                <Text className="text-white font-semibold text-base">
                  Save Memory
                </Text>
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
