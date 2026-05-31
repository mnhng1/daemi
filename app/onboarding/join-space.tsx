import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useJoinCoupleSpace, useCurrentCoupleSpace } from "../../src/features/couple-space";
import { colors } from "../../src/lib/theme/tokens";

export default function JoinSpace() {
  const [inviteCode, setInviteCode] = useState("");
  const { mutate: joinSpace, isPending, error } = useJoinCoupleSpace();
  const { data: coupleSpaceData } = useCurrentCoupleSpace();

  useEffect(() => {
    if (coupleSpaceData) router.replace("/");
  }, [coupleSpaceData]);

  function handleJoin() {
    joinSpace({ inviteCode });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-paper"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <Text className="text-ink font-bold text-2xl text-center mb-2">
            Join a space
          </Text>
          <Text className="text-ink-2 text-center mb-10">
            Enter the invite code your partner shared with you.
          </Text>

          <View className="mb-6">
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">
              Invite code
            </Text>
            <TextInput
              className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
              placeholder="XXXXXXXX"
              placeholderTextColor={colors.ink3}
              autoCapitalize="characters"
              autoCorrect={false}
              value={inviteCode}
              onChangeText={setInviteCode}
            />
          </View>

          <Pressable
            className="bg-accent rounded-xl py-3.5 items-center"
            onPress={handleJoin}
            disabled={isPending || inviteCode.trim().length === 0}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Join Space
              </Text>
            )}
          </Pressable>

          {error && (
            <Text className="text-red-500 text-sm text-center mt-3">
              {error.message}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
