import { Tabs, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../../src/lib/theme/tokens";
import { useSession } from "../../src/features/auth";
import { useCurrentCoupleSpace } from "../../src/features/couple-space";
import { useRealtimeSync } from "../../src/features/realtime";
import { BottomTabBar } from "../../src/components/navigation/bottom-tab-bar";

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
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        // Each screen renders its own top-left title, so the navigator header is
        // pure duplication — hide it everywhere and reclaim the vertical space.
        headerShown: false,
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
      }}
    >
      {/* Declaration order = tab-bar order: the centred `add` becomes the raised FAB. */}
      <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
      <Tabs.Screen name="collections" options={{ title: "Collections" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="places" options={{ title: "Places" }} />
      <Tabs.Screen name="settings" options={{ title: "You" }} />
      {/* Search stays a mounted route (Timeline header pushes to it) but is hidden
          from the tab bar — `href: null` removes it from the bar's route list. */}
      <Tabs.Screen name="search" options={{ href: null, title: "Find" }} />
    </Tabs>
  );
}
