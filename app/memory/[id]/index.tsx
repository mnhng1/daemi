import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemory } from "../../../src/features/memories";
import { LetterDetailView } from "../../../src/components/memory/letter-detail-view";
import { PhotoDetailView } from "../../../src/components/memory/photo-detail-view";
import { VideoDetailView } from "../../../src/components/memory/video-detail-view";
import { TicketDetailView } from "../../../src/components/memory/ticket-detail-view";
import { colors } from "../../../src/lib/theme/tokens";

export default function MemoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: memory, isLoading, isError } = useMemory(id);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError || !memory) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.ink, fontSize: 16, marginBottom: 16 }}>Memory not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.accent, fontSize: 16 }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  switch (memory.type) {
    case "letter":
      return <LetterDetailView memory={memory} />;
    case "video":
      return <VideoDetailView memory={memory} />;
    case "ticket":
      return <TicketDetailView memory={memory} />;
    case "photo":
    default:
      return <PhotoDetailView memory={memory} />;
  }
}
