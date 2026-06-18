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
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useVerifyEmailOtp, useRequestEmailOtp } from "../../src/features/auth";
import { colors, fonts } from "../../src/lib/theme/tokens";

export default function VerifyStep() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const verify = useVerifyEmailOtp();
  const requestOtp = useRequestEmailOtp();

  function handleCodeChange(text: string) {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(digits);
    if (error) setError(null);
    if (resent) setResent(false);
    // Auto-submit when 6 digits entered
    if (digits.length === 6) {
      submitCode(digits);
    }
  }

  function submitCode(token: string) {
    if (!email) return;
    setError(null);
    verify.mutate(
      { email, token },
      {
        // On success, SessionProvider + app/index.tsx handle redirect — no navigate here
        onError: (e) => setError(e.message),
      },
    );
  }

  function handleVerify() {
    if (code.length < 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    submitCode(code);
  }

  function handleResend() {
    if (!email) return;
    setError(null);
    setResent(false);
    requestOtp.mutate(
      { email },
      {
        onSuccess: () => setResent(true),
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
        {/* Back / change email */}
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
            check your email
          </Text>
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 15,
              color: colors.ink3,
              marginBottom: 36,
            }}
          >
            we sent a 6-digit code to{" "}
            <Text style={{ color: colors.ink2 }}>{email}</Text>
          </Text>

          {/* 6-digit code input */}
          <TextInput
            className="bg-shade rounded-xl px-4 text-ink text-center"
            style={{
              fontSize: 28,
              letterSpacing: 12,
              fontFamily: fonts.ui,
              paddingVertical: 16,
            }}
            placeholder="——————"
            placeholderTextColor={colors.ink4}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            textContentType="oneTimeCode"
            value={code}
            onChangeText={handleCodeChange}
          />

          {/* Inline error */}
          {error && (
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 13,
                color: colors.destructive,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              {error}
            </Text>
          )}

          {/* Resent confirmation */}
          {resent && !error && (
            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 13,
                color: colors.ink3,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              code sent! check your inbox.
            </Text>
          )}

          {/* Verify button */}
          <TouchableOpacity
            className="bg-accent rounded-xl py-3.5 items-center"
            style={{ marginTop: 20 }}
            onPress={handleVerify}
            disabled={verify.isPending || code.length < 6}
            activeOpacity={0.82}
          >
            {verify.isPending ? (
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
                Verify
              </Text>
            )}
          </TouchableOpacity>

          {/* Link actions */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 24,
              gap: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleResend}
              disabled={requestOtp.isPending}
              activeOpacity={0.7}
            >
              {requestOtp.isPending ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Text
                  style={{
                    fontFamily: fonts.ui,
                    fontSize: 14,
                    color: colors.accent,
                  }}
                >
                  Resend code
                </Text>
              )}
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: fonts.ui,
                fontSize: 14,
                color: colors.ink4,
              }}
            >
              ·
            </Text>

            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text
                style={{
                  fontFamily: fonts.ui,
                  fontSize: 14,
                  color: colors.ink3,
                }}
              >
                Change email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
