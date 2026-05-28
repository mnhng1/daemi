import { Stack } from "expo-router";
import { colors } from "../../src/lib/theme/tokens";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
      }}
    />
  );
}
