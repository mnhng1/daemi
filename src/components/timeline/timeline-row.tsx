import { View } from "react-native";
import { Memory } from "../../types/database";
import { MemoryCard } from "../memory/memory-card";
import { TimelineSpine } from "./timeline-spine";
import { colors } from "../../lib/theme/tokens";

interface Props {
  memory: Memory;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

export function TimelineRow({ memory, index, isFirst, isLast }: Props) {
  const nodeColor = memory.type === "letter" ? colors.accent : colors.ink3;

  return (
    <View className="flex-row px-4">
      <TimelineSpine
        showTop={!isFirst}
        showBottom={!isLast}
        nodeColor={nodeColor}
      />
      <View className="flex-1 ml-3 pb-4">
        <MemoryCard memory={memory} index={index} />
      </View>
    </View>
  );
}
