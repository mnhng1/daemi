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
import { useCreateCoupleSpace, useCurrentCoupleSpace } from "../../src/features/couple-space";
import { colors } from "../../src/lib/theme/tokens";

export default function CreateSpace() {
  const [name, setName] = useState("");
  const { mutate: createSpace, isPending, error } = useCreateCoupleSpace();
  const { data: coupleSpaceData } = useCurrentCoupleSpace();

  useEffect(() => {
    if (coupleSpaceData) router.replace("/");
  }, [coupleSpaceData]);

  function handleCreate() {
    createSpace({ name: name.trim() || undefined });
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
            Create your space
          </Text>
          <Text className="text-ink-2 text-center mb-10">
            Give your shared space a name (optional).
          </Text>

          <View className="mb-6">
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">
              Space name
            </Text>
            <TextInput
              className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
              placeholder="e.g. Our adventures"
              placeholderTextColor={colors.ink3}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Pressable
            className="bg-accent rounded-xl py-3.5 items-center"
            onPress={handleCreate}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Space
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
