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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../../lib/theme/tokens";
import { formatTimelineDate } from "../../lib/utils/date";
import { TagInput, type TagInputHandle } from "./tag-input";
import { LocationPicker } from "./location-picker";
import type { ResolvedPlace } from "../../features/places";

export type TicketSendPayload = {
  title: string;
  body?: string;
  imageUri?: string;
  mimeType?: string;
  dateHappened: string;
  tags: string[];
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
};

interface Props {
  spaceId: string | undefined;
  isPending?: boolean;
  onSend: (payload: TicketSendPayload) => void;
  onCancel: () => void;
}

export function TicketComposer({ spaceId, isPending, onSend, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [seat, setSeat] = useState("");
  const [note, setNote] = useState("");
  const [dateHappened, setDateHappened] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState<{ uri: string; mimeType: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [place, setPlace] = useState<ResolvedPlace | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const tagInputRef = useRef<TagInputHandle>(null);

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
    }
  }

  function handleSave() {
    if (!title.trim()) {
      setTitleError("What's the event? (required)");
      return;
    }
    setTitleError(null);

    // Per I-F: seat folds into note — prepend "Seat: ..." line if seat is set
    let finalBody: string | undefined;
    const seatTrimmed = seat.trim();
    const noteTrimmed = note.trim();
    if (seatTrimmed && noteTrimmed) {
      finalBody = `Seat: ${seatTrimmed}\n${noteTrimmed}`;
    } else if (seatTrimmed) {
      finalBody = `Seat: ${seatTrimmed}`;
    } else if (noteTrimmed) {
      finalBody = noteTrimmed;
    }

    const finalTags = tagInputRef.current?.flush() ?? tags;
    onSend({
      title: title.trim(),
      body: finalBody,
      imageUri: image?.uri,
      mimeType: image?.mimeType,
      dateHappened,
      tags: finalTags,
      place_name: place?.place_name ?? null,
      latitude: place?.latitude ?? null,
      longitude: place?.longitude ?? null,
    });
  }

  const canSave = !!title.trim() && !isPending;

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={12}>
          <Text style={styles.headerAction}>cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>new ticket</Text>
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
            {/* Stub photo (optional) */}
            <TouchableOpacity
              onPress={pickImage}
              disabled={isPending}
              style={styles.mediaPicker}
              activeOpacity={0.75}
            >
              {image ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.stubImage}
                    resizeMode="cover"
                  />
                  <View style={styles.changeHint}>
                    <Text style={styles.changeHintText}>tap to change</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={36}
                    color={colors.ink3}
                  />
                  <Text style={styles.placeholderText}>
                    add a stub photo{" "}
                    <Text style={styles.optional}>(optional)</Text>
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* What (required) */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>What</Text>
              <TextInput
                style={[styles.input, titleError ? styles.inputError : null]}
                placeholder="Bon Iver · Brooklyn Steel"
                placeholderTextColor={colors.ink3}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (t.trim()) setTitleError(null);
                }}
                editable={!isPending}
              />
              {titleError && (
                <Text style={styles.errorText}>{titleError}</Text>
              )}
            </View>

            {/* When + Seat row */}
            <View style={styles.rowFields}>
              <View style={[styles.field, styles.fieldFlex]}>
                <Text style={styles.fieldLabel}>When</Text>
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

              <View style={[styles.field, styles.fieldSeat]}>
                <Text style={styles.fieldLabel}>
                  Seat{" "}
                  <Text style={styles.optional}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Row F · 12"
                  placeholderTextColor={colors.ink3}
                  value={seat}
                  onChangeText={setSeat}
                  editable={!isPending}
                />
              </View>
            </View>

            {/* Note */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Note{" "}
                <Text style={styles.optional}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput, styles.noteInput]}
                placeholder="How was it?"
                placeholderTextColor={colors.ink3}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={note}
                onChangeText={setNote}
                editable={!isPending}
              />
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
    fontFamily: "CormorantInfant_600SemiBold",
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
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.ink4,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.shade,
  },
  placeholderText: {
    color: colors.ink3,
    fontSize: 14,
  },
  imageWrapper: {
    position: "relative",
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
  },
  stubImage: {
    width: "100%",
    height: "100%",
  },
  changeHint: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.50)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  changeHintText: {
    color: "#fff",
    fontSize: 11,
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
  rowFields: {
    flexDirection: "row",
    gap: 10,
  },
  fieldFlex: {
    flex: 1.4,
  },
  fieldSeat: {
    flex: 1,
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
  inputError: {
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  inputText: {
    color: colors.ink,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 14,
  },
  noteInput: {
    fontFamily: "CormorantInfant_400Regular_Italic",
    fontSize: 17,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: -2,
  },
});
