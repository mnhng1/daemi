import { View } from "react-native";
import { Memory } from "../../types/database";
import { TimelineItem, isMemoryGroup } from "../../features/memories/types";
import { MemoryCard } from "../memory/memory-card";
import { MemoryCarousel } from "../memory/memory-carousel";
import { TimelineSpine } from "./timeline-spine";
import { colors } from "../../lib/theme/tokens";

interface Props {
  item: TimelineItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

export function TimelineRow({ item, index, isFirst, isLast }: Props) {
  const nodeColor = isMemoryGroup(item)
    ? item.memories[0].type === "letter" ? colors.accent : colors.ink3
    : item.type === "letter" ? colors.accent : colors.ink3;

  return (
    <View className="flex-row px-4">
      <TimelineSpine
        showTop={!isFirst}
        showBottom={!isLast}
        nodeColor={nodeColor}
      />
      <View className="flex-1 ml-3 pb-4">
        {isMemoryGroup(item) ? (
          <MemoryCarousel memories={item.memories} />
        ) : (
          <MemoryCard memory={item} index={index} />
        )}
      </View>
    </View>
  );
}
