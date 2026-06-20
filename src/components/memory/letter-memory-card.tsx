import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MemoryWithAuthor } from "../../types/database";
import { colors } from "../../lib/theme/tokens";
import { wordCount } from "../../lib/utils/text";

interface Props {
  memory: MemoryWithAuthor;
}

// Ruled-paper geometry for the preview — body line-height equals the ruling
// spacing so the handwriting sits on the lines (mirrors the editor / detail
// view). Three lines, matching numberOfLines below.
const CARD_LINE_HEIGHT = 26;
const CARD_FONT_SIZE = 16;
const CARD_LINES = 3;
// Push row-0's baseline down onto the first ruled line (see letter-composer).
const CARD_PAD_TOP = Math.round(CARD_LINE_HEIGHT * 0.2);

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

      {/* Ruled preview — handwriting sitting on reference lines */}
      <View style={{ position: "relative", height: CARD_PAD_TOP + CARD_LINE_HEIGHT * CARD_LINES }}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: CARD_LINES }).map((_, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: CARD_LINE_HEIGHT * (i + 1),
                height: StyleSheet.hairlineWidth,
                backgroundColor: colors.ink4,
                opacity: 0.7,
              }}
            />
          ))}
        </View>

        <Text
          className="text-ink-2"
          style={{
            fontFamily: "CormorantInfant_400Regular_Italic",
            fontStyle: "italic",
            fontSize: CARD_FONT_SIZE,
            lineHeight: CARD_LINE_HEIGHT,
            paddingTop: CARD_PAD_TOP,
          }}
          numberOfLines={CARD_LINES}
        >
          {memory.body}
        </Text>
      </View>

      <View className="flex-row justify-end items-center gap-1.5 mt-3">
        {memory.reactions.length > 0 && (
          <Text style={{ fontSize: 12 }}>❤️</Text>
        )}
        <Text className="text-ink-3 text-xs">{wordCount(memory.body)} words</Text>
      </View>
    </View>
  );
});
