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
import { useSignUp } from "../../src/features/auth";
import { colors } from "../../src/lib/theme/tokens";

const schema = z
  .object({
    displayName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignUp() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const signUp = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormData) {
    setAuthError(null);
    signUp.mutate(
      {
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      },
      {
        onSuccess: () => setSuccess(true),
        onError: (error) => setAuthError(error.message),
      },
    );
  }

  if (success) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-6">
        <Text className="text-accent font-bold text-3xl text-center mb-2">
          daemi
        </Text>
        <Text className="text-ink text-lg font-semibold text-center mb-3">
          Check your email
        </Text>
        <Text className="text-ink-3 text-center mb-8">
          We sent a confirmation link to your email address.
        </Text>
        <Link href="/(auth)/sign-in">
          <Text className="text-accent font-medium">Back to Sign In</Text>
        </Link>
      </View>
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
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">
              Display Name{" "}
              <Text className="text-ink-3 font-normal">(optional)</Text>
            </Text>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                  placeholder="Your name"
                  placeholderTextColor={colors.ink3}
                  autoCapitalize="words"
                  autoComplete="name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

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

          <View className="mb-4">
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
                  autoComplete="new-password"
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

          <View className="mb-6">
            <Text className="text-ink-2 text-sm mb-1.5 font-medium">
              Confirm Password
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-shade rounded-xl px-4 py-3.5 text-ink text-base"
                  placeholder="••••••"
                  placeholderTextColor={colors.ink3}
                  secureTextEntry
                  autoComplete="new-password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className="bg-accent rounded-xl py-3.5 items-center"
            onPress={handleSubmit(onSubmit)}
            disabled={signUp.isPending}
          >
            {signUp.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          {authError && (
            <Text className="text-red-500 text-sm text-center mt-3">
              {authError}
            </Text>
          )}

          <View className="flex-row justify-center mt-8">
            <Text className="text-ink-3">Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-accent font-medium">Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
