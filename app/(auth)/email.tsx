import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { useRequestEmailOtp } from "../../src/features/auth";
import { colors, fonts } from "../../src/lib/theme/tokens";

export default function EmailStep() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const requestOtp = useRequestEmailOtp();

  function handleContinue() {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    requestOtp.mutate(
      { email: trimmed },
      {
        onSuccess: () =>
          router.push({
            pathname: "/(auth)/verify",
            params: { email: trimmed },
          }),
        onError: (e) => setError(e.message),
      },
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.paper }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Back affordance */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}
        >
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 15,
              color: colors.ink3,
            }}
          >
            ← back
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 32 }}>
          {/* Caveat prompt */}
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: 48,
              color: colors.ink,
              lineHeight: 54,
              marginBottom: 8,
            }}
          >
            what's your email?
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 15,
              color: colors.ink3,
              marginBottom: 36,
            }}
          >
            we'll send you a code
          </Text>

          {/* Email input */}
          <TextInput
            className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
            placeholder="you@example.com"
            placeholderTextColor={colors.ink3}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            autoFocus
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError(null);
            }}
            onSubmitEditing={handleContinue}
            returnKeyType="done"
          />

          {/* Inline error */}
          {error && (
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 13,
                color: colors.destructive,
                marginTop: 8,
              }}
            >
              {error}
            </Text>
          )}

          {/* Continue button */}
          <TouchableOpacity
            className="bg-accent rounded-xl py-3.5 items-center"
            style={{ marginTop: 20 }}
            onPress={handleContinue}
            disabled={requestOtp.isPending}
            activeOpacity={0.82}
          >
            {requestOtp.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  fontFamily: fonts.ui,
                  fontSize: 16,
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
