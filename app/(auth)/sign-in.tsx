import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useSignIn } from "../../src/features/auth";
import { colors } from "../../src/lib/theme/tokens";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function SignIn() {
  const [authError, setAuthError] = useState<string | null>(null);
  const signIn = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    setAuthError(null);
    signIn.mutate(
      { email: data.email, password: data.password },
      {
        onError: (error) => {
          setAuthError(error.message);
        },
      },
    );
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
          <Text className="text-accent font-bold text-3xl text-center mb-1">
            daemi
          </Text>
          <Text className="text-ink-3 text-center mb-10">
            your shared scrapbook
          </Text>

          <View className="mb-4">
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.ink3}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                  placeholder="••••••"
                  placeholderTextColor={colors.ink3}
                  secureTextEntry
                  autoComplete="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="bg-accent rounded-xl py-3.5 items-center"
            onPress={handleSubmit(onSubmit)}
            disabled={signIn.isPending}
          >
            {signIn.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {authError && (
            <Text className="text-red-500 text-sm text-center mt-3">
              {authError}
            </Text>
          )}

          <View className="flex-row justify-center mt-8">
            <Text className="text-ink-3">Don't have an account? </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-accent font-medium">Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
