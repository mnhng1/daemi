import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCreateCollection } from "../../features/collections/use-create-collection";
import { COLLECTION_TYPE_LABELS } from "../../features/collections/format";
import { errorMessage } from "../../lib/utils/log";
import { colors } from "../../lib/theme/tokens";

type CollectionType = "trip" | "anniversary" | "custom";

const TYPES: CollectionType[] = ["trip", "anniversary", "custom"];

// Parse YYYY-MM-DD and confirm it's a real calendar date (rejects 2024-13-45,
// 2024-02-30, etc. that a shape-only regex would let reach the Postgres `date` column).
function coerceDate(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "" || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  // Round-trip guard: JS rolls overflow (Feb 30 → Mar 2), so a mismatch means invalid.
  return d.toISOString().slice(0, 10) === trimmed ? trimmed : null;
}

// Returns true if blank (allowed — nullable field) or a valid calendar date.
function isValidDateOrBlank(value: string): boolean {
  if (value.trim() === "") return true;
  return coerceDate(value) !== null;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  coupleSpaceId: string;
  userId: string;
  onCreated?: (collectionId: string) => void;
}

export function CreateCollectionSheet({
  visible,
  onClose,
  coupleSpaceId,
  userId,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CollectionType>("trip");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const createCollection = useCreateCollection();

  function resetForm() {
    setName("");
    setType("trip");
    setDescription("");
    setStartDate("");
    setEndDate("");
  }

  // Reset form whenever the sheet closes.
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const nameIsEmpty = name.trim() === "";
  const startValid = isValidDateOrBlank(startDate);
  const endValid = isValidDateOrBlank(endDate);
  // Coerced values compare correctly as plain strings for YYYY-MM-DD.
  const start = coerceDate(startDate);
  const end = coerceDate(endDate);
  const rangeBackwards = start !== null && end !== null && end < start;
  const canSubmit =
    !nameIsEmpty &&
    startValid &&
    endValid &&
    !rangeBackwards &&
    !createCollection.isPending;

  async function handleSubmit() {
    if (!canSubmit) return;

    try {
      const data = await createCollection.mutateAsync({
        coupleSpaceId,
        userId,
        name,
        type,
        startDate: start,
        endDate: end,
        description: description.trim() || null,
      });
      onCreated?.(data.id);
      onClose();
    } catch (err) {
      Alert.alert(
        "Could not create collection",
        __DEV__
          ? errorMessage(err)
          : "Something went wrong. Please try again.",
      );
    }
  }

  function handleClose() {
    if (!createCollection.isPending) {
      onClose();
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleClose}
              disabled={createCollection.isPending}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              hitSlop={12}
            >
              <Text
                style={[
                  styles.headerAction,
                  createCollection.isPending && styles.disabled,
                ]}
              >
                Cancel
              </Text>
            </Pressable>
            <Text style={styles.headerTitle}>New Collection</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Save collection"
              hitSlop={12}
            >
              <Text
                style={[
                  styles.headerAction,
                  styles.headerActionAccent,
                  !canSubmit && styles.disabled,
                ]}
              >
                {createCollection.isPending ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tokyo Trip 2024"
              placeholderTextColor={colors.ink4}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              autoFocus
              maxLength={120}
            />

            {/* Type */}
            <Text style={[styles.label, { marginTop: 20 }]}>Type</Text>
            <View style={styles.chipRow}>
              {TYPES.map((t) => {
                const selected = t === type;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={COLLECTION_TYPE_LABELS[t]}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {COLLECTION_TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Dates */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Start date{" "}
              <Text style={styles.labelHint}>(YYYY-MM-DD, optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                startDate.trim() !== "" &&
                  !isValidDateOrBlank(startDate) &&
                  styles.inputError,
              ]}
              placeholder="2024-04-01"
              placeholderTextColor={colors.ink4}
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>
              End date{" "}
              <Text style={styles.labelHint}>(YYYY-MM-DD, optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                ((endDate.trim() !== "" && !endValid) || rangeBackwards) &&
                  styles.inputError,
              ]}
              placeholder="2024-04-10"
              placeholderTextColor={colors.ink4}
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
              returnKeyType="next"
            />
            {rangeBackwards && (
              <Text style={styles.fieldError}>
                End date can&apos;t be before the start date.
              </Text>
            )}

            {/* Description */}
            <Text style={[styles.label, { marginTop: 20 }]}>
              Description{" "}
              <Text style={styles.labelHint}>(optional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="A few words about this collection…"
              placeholderTextColor={colors.ink4}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  headerAction: {
    fontSize: 16,
    color: colors.ink3,
  },
  headerActionAccent: {
    color: colors.accent,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink2,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  labelHint: {
    fontWeight: "400",
    textTransform: "none",
    letterSpacing: 0,
    color: colors.ink3,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.ink4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  fieldError: {
    fontSize: 13,
    color: colors.destructive,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ink4,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 14,
    color: colors.ink2,
  },
  chipTextSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
});
