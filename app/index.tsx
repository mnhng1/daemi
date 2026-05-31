import { Redirect } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSession } from "../src/features/auth";
import { useCurrentCoupleSpace } from "../src/features/couple-space";
import { colors } from "../src/lib/theme/tokens";

export default function Index() {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: coupleSpaceData, isLoading: spaceLoading, error: spaceError, refetch, isFetching } = useCurrentCoupleSpace();

  // Show loading spinner while checking auth + couple space
  if (sessionLoading || (session && spaceLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // No session → auth
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // Real error fetching couple space → show error UI with retry
  if (spaceError) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-6 gap-4">
        <Text className="text-ink text-center">
          Something went wrong loading your space.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          disabled={isFetching}
          className={`px-6 py-3 rounded-lg ${isFetching ? "bg-accent/50" : "bg-accent"}`}
        >
          <Text className="text-paper font-medium">{isFetching ? "Retrying..." : "Retry"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Session but no couple space → onboarding
  if (!coupleSpaceData) {
    return <Redirect href="/onboarding" />;
  }

  // Session + couple space → timeline
  return <Redirect href="/(tabs)/timeline" />;
}
