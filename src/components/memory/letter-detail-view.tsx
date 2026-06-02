import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MemoryWithAuthor } from "../../types/database";
import { formatLetterDate } from "../../lib/utils/date";
import { wordCount } from "../../lib/utils/text";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: MemoryWithAuthor;
}

export function LetterDetailView({ memory }: Props) {
  const router = useRouter();
  const authorName = memory.author?.display_name?.toUpperCase() ?? "UNKNOWN";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.letterPaper }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Text style={{ fontSize: 24, color: colors.ink }}>←</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: colors.accent, fontSize: 16, marginRight: 8 }}>✎</Text>
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.5 }}>
              LETTER FROM {authorName}
            </Text>
          </View>

          {memory.title && (
            <Text style={{ color: colors.ink, fontSize: 24, fontFamily: "CormorantInfant_600SemiBold", marginBottom: 8 }}>
              {memory.title}
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>{formatLetterDate(memory.date_happened)}</Text>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>·</Text>
            <Text style={{ color: colors.ink3, fontSize: 14 }}>{wordCount(memory.body)} words</Text>
          </View>
        </View>

        <View style={{ width: 48, height: 2, backgroundColor: colors.accent, marginBottom: 32 }} />

        <Text
          style={{
            fontFamily: "CormorantInfant_400Regular_Italic",
            fontStyle: "italic",
            color: colors.ink,
            fontSize: 18,
            lineHeight: 32,
          }}
          accessibilityRole="text"
        >
          {memory.body}
        </Text>

        <View style={{ marginTop: 48, alignItems: "center" }}>
          <View style={{ width: 32, height: 2, backgroundColor: colors.ink4, marginBottom: 16 }} />
          <Text style={{ color: colors.ink3, fontSize: 12, fontStyle: "italic" }}>Written with love</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
