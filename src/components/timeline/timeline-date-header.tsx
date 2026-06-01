import { View, Text } from "react-native";

interface Props {
  title: string;
  isFirst?: boolean;
}

export function TimelineDateHeader({ title, isFirst = false }: Props) {
  return (
    <View className="flex-row items-center py-2 px-4">
      <View className="w-[44px] items-center">
        {!isFirst && <View className="w-[2px] h-full bg-ink-4 absolute" />}
      </View>
      <View className="ml-3">
        <Text className="text-ink-2 text-sm font-semibold uppercase tracking-wider">
          {title}
        </Text>
      </View>
    </View>
  );
}
