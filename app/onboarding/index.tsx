import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function Onboarding() {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-paper">
      <Text className="text-accent font-bold text-3xl text-center mb-2">
        daemi
      </Text>
      <Text className="text-ink-2 text-center mb-12">
        Welcome! Let's set up your shared space.
      </Text>

      <View className="w-full gap-4">
        <Pressable
          className="bg-accent rounded-xl py-3.5 items-center"
          onPress={() => router.push("/onboarding/create-space")}
        >
          <Text className="text-white font-semibold text-base">
            Create our space
          </Text>
        </Pressable>

        <Pressable
          className="bg-shade rounded-xl py-3.5 items-center border border-ink-3/20"
          onPress={() => router.push("/onboarding/join-space")}
        >
          <Text className="text-ink font-semibold text-base">
            Join with invite code
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
