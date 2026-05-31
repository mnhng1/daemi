import { Stack, Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../../src/features/auth";
import { colors } from "../../src/lib/theme/tokens";

export default function AuthLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-paper">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (session) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
