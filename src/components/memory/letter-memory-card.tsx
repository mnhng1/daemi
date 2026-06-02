import React from "react";
import { View, Text } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import { colors } from "../../lib/theme/tokens";
import { formatLetterDate } from "../../lib/utils/date";
import { wordCount } from "../../lib/utils/text";

interface Props {
  memory: MemoryWithAuthor;
}

export const LetterMemoryCard = React.memo(function LetterMemoryCard({ memory }: Props) {
  const authorName = memory.author?.display_name?.toUpperCase() ?? "UNKNOWN";

  return (
    <View
      className="bg-letter-paper rounded-xl border border-ink-4/20 p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: colors.accent }}
    >
      <View className="flex-row items-center mb-2">
        <Text className="text-accent text-sm mr-1.5">✎</Text>
        <Text className="text-accent text-xs uppercase tracking-wider font-semibold">
          LETTER FROM {authorName}
        </Text>
      </View>

      <Text
        className="text-ink-2 text-base leading-relaxed"
        style={{ fontFamily: "CormorantInfant_400Regular_Italic", fontStyle: "italic" }}
        numberOfLines={3}
      >
        {memory.body}
      </Text>

      <View className="flex-row justify-between mt-3">
        <Text className="text-ink-3 text-xs">{formatLetterDate(memory.date_happened)}</Text>
        <Text className="text-ink-3 text-xs">{wordCount(memory.body)} words</Text>
      </View>
    </View>
  );
});
