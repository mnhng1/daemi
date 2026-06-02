import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemory, useUpdateMemory } from "../../../src/features/memories";
import { useSession } from "../../../src/features/auth/session-provider";
import { useCurrentUser } from "../../../src/features/auth";
import { usePartner } from "../../../src/features/couple-space";
import { LetterComposer } from "../../../src/components/add-memory/letter-composer";
import { formatTimelineDate } from "../../../src/lib/utils/date";
import { colors } from "../../../src/lib/theme/tokens";

export default function EditMemory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useSession();
  const { data: currentUser } = useCurrentUser();
  const { data: partnerName } = usePartner();
  const { data: memory, isLoading, isError } = useMemory(id);
  const updateMemory = useUpdateMemory();

  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [dateHappened, setDateHappened] = useState<string>("");
  const [placeName, setPlaceName] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Seed form state once memory loads
  if (memory && !initialized) {
    setTitle(memory.title ?? "");
    setBody(memory.body ?? "");
    setDateHappened(memory.date_happened);
    setPlaceName(memory.place_name ?? "");
    setInitialized(true);
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError || !memory) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: colors.ink, fontSize: 16, marginBottom: 16 }}>Memory not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.accent, fontSize: 16 }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Author-only guard (RLS is the server backstop)
  if (memory.created_by_user_id !== session?.user.id) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: colors.ink, fontSize: 16, marginBottom: 16 }}>You can only edit your own memories.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.accent, fontSize: 16 }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (memory.type === "letter") {
    function handleLetterSend(updatedBody: string) {
      if (!updatedBody.trim()) return;
      updateMemory.mutate(
        { id: memory!.id, body: updatedBody, date_happened: dateHappened || memory!.date_happened },
        { onSuccess: () => router.back() }
      );
    }

    return (
      <LetterComposer
        partnerName={partnerName ?? null}
        authorName={currentUser?.display_name ?? null}
        isPending={updateMemory.isPending}
        initialBody={memory.body ?? ""}
        onSend={handleLetterSend}
        onCancel={() => router.back()}
      />
    );
  }

  // Photo meta edit form
  function handleSave() {
    updateMemory.mutate(
      {
        id: memory!.id,
        title: title.trim() || null,
        body: body.trim() || null,
        date_happened: dateHappened,
        place_name: placeName.trim() || null,
      },
      { onSuccess: () => router.back() }
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                <Text style={{ fontSize: 22, color: colors.ink }}>←</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.ink, fontWeight: "bold", fontSize: 20 }}>Edit Memory</Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.ink2, fontSize: 14, marginBottom: 6, fontWeight: "500" }}>
                Caption <Text style={{ color: colors.ink3, fontWeight: "400" }}>(optional)</Text>
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.shade,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.ink,
                  fontSize: 16,
                }}
                placeholder="A short caption"
                placeholderTextColor={colors.ink3}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.ink2, fontSize: 14, marginBottom: 6, fontWeight: "500" }}>
                Note <Text style={{ color: colors.ink3, fontWeight: "400" }}>(optional)</Text>
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.shade,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.ink,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Tell the story behind this memory..."
                placeholderTextColor={colors.ink3}
                multiline
                numberOfLines={4}
                value={body}
                onChangeText={setBody}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.ink2, fontSize: 14, marginBottom: 6, fontWeight: "500" }}>Place</Text>
              <TextInput
                style={{
                  backgroundColor: colors.shade,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: colors.ink,
                  fontSize: 16,
                }}
                placeholder="Where was this?"
                placeholderTextColor={colors.ink3}
                value={placeName}
                onChangeText={setPlaceName}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: colors.ink2, fontSize: 14, marginBottom: 6, fontWeight: "500" }}>Date</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.shade,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.ink, fontSize: 16 }}>
                  {dateHappened ? formatTimelineDate(dateHappened) : "Select date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date((dateHappened || memory.date_happened) + "T00:00:00")}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (selectedDate) {
                      setDateHappened(selectedDate.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                opacity: updateMemory.isPending ? 0.5 : 1,
              }}
              onPress={handleSave}
              disabled={updateMemory.isPending}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                {updateMemory.isPending ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            {updateMemory.isError && (
              <Text style={{ color: colors.destructive, fontSize: 14, textAlign: "center", marginTop: 12 }}>
                {updateMemory.error?.message ?? "Something went wrong"}
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
