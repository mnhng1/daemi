import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCollections } from "../../features/collections/use-collections";
import { useSetMemoryCollection } from "../../features/collections/use-set-memory-collection";
import {
  COLLECTION_TYPE_LABELS,
  formatCollectionDateRange,
} from "../../features/collections/format";
import { errorMessage } from "../../lib/utils/log";
import { colors } from "../../lib/theme/tokens";

interface Props {
  visible: boolean;
  onClose: () => void;
  coupleSpaceId: string;
  memoryId: string;
  currentCollectionId: string | null;
}

export function CollectionPickerSheet({
  visible,
  onClose,
  coupleSpaceId,
  memoryId,
  currentCollectionId,
}: Props) {
  const [pendingId, setPendingId] = useState<string | "none" | null>(null);

  const { data: collections, isLoading } = useCollections(coupleSpaceId);
  const setMemoryCollection = useSetMemoryCollection();

  async function handleSelect(collectionId: string | null) {
    const key = collectionId ?? "none";
    if (pendingId !== null) return; // prevent double-tap
    // Re-selecting the current assignment is a no-op — skip the redundant write + refetch.
    if (collectionId === currentCollectionId) {
      onClose();
      return;
    }
    setPendingId(key);
    try {
      await setMemoryCollection.mutateAsync({ memoryId, collectionId });
      onClose();
    } catch (err) {
      Alert.alert(
        "Could not update collection",
        __DEV__
          ? errorMessage(err)
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPendingId(null);
    }
  }

  const isBusy = pendingId !== null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { if (!isBusy) onClose(); }}
    >
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => { if (!isBusy) onClose(); }}
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            hitSlop={12}
          >
            <Text style={[styles.headerAction, isBusy && styles.disabled]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={styles.headerTitle}>Add to Collection</Text>
          {/* spacer to balance header */}
          <View style={{ width: 52 }} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !collections || collections.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No collections yet.{"\n"}Create one from the Collections tab.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {/* None option — clears assignment */}
            <Pressable
              onPress={() => handleSelect(null)}
              disabled={isBusy}
              accessibilityRole="radio"
              accessibilityState={{ checked: currentCollectionId === null }}
              accessibilityLabel="No collection"
              style={[styles.row, currentCollectionId === null && styles.rowSelected]}
            >
              <View style={styles.rowContent}>
                <Text style={styles.rowName}>No collection</Text>
              </View>
              <View style={styles.rowRight}>
                {pendingId === "none" ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : currentCollectionId === null ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : null}
              </View>
            </Pressable>

            {collections.map((col) => {
              const isSelected = col.id === currentCollectionId;
              const isPending = pendingId === col.id;
              const dateRange = formatCollectionDateRange(col.start_date, col.end_date);

              return (
                <Pressable
                  key={col.id}
                  onPress={() => handleSelect(col.id)}
                  disabled={isBusy}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={col.name}
                  style={[styles.row, isSelected && styles.rowSelected]}
                >
                  <View style={styles.rowContent}>
                    <Text style={[styles.rowName, isSelected && styles.rowNameSelected]}>
                      {col.name}
                    </Text>
                    <Text style={styles.rowMeta}>
                      {COLLECTION_TYPE_LABELS[col.type]}
                      {dateRange ? `  ·  ${dateRange}` : ""}
                    </Text>
                  </View>
                  <View style={styles.rowRight}>
                    {isPending ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : isSelected ? (
                      <Text style={styles.checkmark}>✓</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
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
  disabled: {
    opacity: 0.4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    color: colors.ink3,
    textAlign: "center",
    lineHeight: 22,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 32,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink4,
  },
  rowSelected: {
    backgroundColor: colors.accentSoft,
  },
  rowContent: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: "500",
  },
  rowNameSelected: {
    color: colors.accent,
    fontWeight: "600",
  },
  rowMeta: {
    fontSize: 13,
    color: colors.ink3,
    marginTop: 2,
  },
  rowRight: {
    width: 28,
    alignItems: "flex-end",
  },
  checkmark: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: "600",
  },
});
