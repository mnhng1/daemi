import React from "react";
import { View, Text } from "react-native";
import { Memory } from "../../types/database";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: Memory;
}

export const LetterMemoryCard = React.memo(function LetterMemoryCard({ memory }: Props) {
  return (
    <View
      className="bg-letter-paper rounded-xl border border-ink-4/20 p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: colors.accent }}
    >
      <Text className="text-accent text-xs font-semibold uppercase tracking-wider mb-2">
        Letter
      </Text>
      {memory.title && (
        <Text className="text-ink text-base font-semibold mb-1">
          {memory.title}
        </Text>
      )}
      {memory.body && (
        <Text className="text-ink-2 text-sm leading-relaxed" numberOfLines={2}>
          {memory.body}
        </Text>
      )}
    </View>
  );
});
