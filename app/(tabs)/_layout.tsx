import { Tabs, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../src/lib/theme/tokens";
import { useSession } from "../../src/features/auth";
import { useCurrentCoupleSpace } from "../../src/features/couple-space";
import { useRealtimeSync } from "../../src/features/realtime";

export default function TabLayout() {
  const { session, isLoading: sessionLoading } = useSession();
  const { data: coupleSpaceData, isLoading: spaceLoading } = useCurrentCoupleSpace();
  useRealtimeSync(coupleSpaceData?.couple_space_id);

  if (sessionLoading || (session && spaceLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (!coupleSpaceData) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: { backgroundColor: colors.paper },
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
      }}
    >
      <Tabs.Screen name="timeline" options={{ title: "Timeline", headerShown: false }} />
      <Tabs.Screen name="collections" options={{ title: "Trips" }} />
      <Tabs.Screen name="add" options={{ title: "Add", headerShown: false }} />
      <Tabs.Screen name="search" options={{ title: "Find" }} />
    </Tabs>
  );
}
