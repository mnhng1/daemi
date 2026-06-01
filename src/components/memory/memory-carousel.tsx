import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Memory } from "../../types/database";
import { MemoryCard } from "./memory-card";

interface Props {
  memories: Memory[];
}

export const MemoryCarousel = React.memo(function MemoryCarousel({ memories }: Props) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        decelerationRate="fast"
        snapToInterval={260}
      >
        {memories.map((memory, i) => (
          <View key={memory.id} style={{ width: 248 }}>
            <MemoryCard memory={memory} index={i} />
          </View>
        ))}
      </ScrollView>
      <Text className="text-ink-3 text-xs mt-2">{memories.length} memories</Text>
    </View>
  );
});
