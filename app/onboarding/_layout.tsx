import { Stack, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../src/lib/theme/tokens";
import { useSession } from "../../src/features/auth";
import { useCurrentCoupleSpace } from "../../src/features/couple-space";

export default function OnboardingLayout() {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: coupleSpaceData, isLoading: spaceLoading } = useCurrentCoupleSpace();

  if (sessionLoading || (session && spaceLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (coupleSpaceData) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
      }}
    />
  );
}
