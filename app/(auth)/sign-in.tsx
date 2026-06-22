import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGoogleSignIn } from "../../src/features/auth";
import { colors, fonts, getAppearance } from "../../src/lib/theme/tokens";

const mono = getAppearance() === "monochrome";

// Muted sage for the small botanical accents (wordmark sprig + divider leaf).
const sage = "#9caf88";

// A soft, paper-friendly shadow for the buttons and the bottom tray.
const softShadow = {
  shadowColor: "#46301c",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
} as const;

const { width: SCREEN_W } = Dimensions.get("window");
// Mascot keeps its native 590×362 aspect; sized to sit comfortably mid-screen.
const MASCOT_W = Math.min(264, SCREEN_W * 0.66);
const MASCOT_H = (MASCOT_W * 362) / 590;

export default function SignIn() {
  const [authError, setAuthError] = useState<string | null>(null);
  const google = useGoogleSignIn();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* Centre column: wordmark, subtitle, then the reading mascot. Padded at
          the bottom so the mascot settles just above the auth tray. */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: SCREEN_W * 0.16,
          paddingBottom: 300,
        }}
      >
        {/* Wordmark — our Caveat hand, with a small sage sprig off the "i". */}
        <Animated.View entering={FadeInDown.delay(150).duration(900)}>
          <View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.display,
                fontSize: 64,
                lineHeight: 88,
                paddingTop: 6,
                paddingHorizontal: 16,
                includeFontPadding: true,
                textAlign: "center",
                color: colors.accent,
              }}
            >
              daemi
            </Text>
            <MaterialCommunityIcons
              name="sprout"
              size={26}
              color={sage}
              style={{
                position: "absolute",
                top: 8,
                right: -2,
                transform: [{ rotate: mono ? "0deg" : "18deg" }],
              }}
            />
          </View>
        </Animated.View>

        {/* Reading mascot — cropped from the reference, feathered to the paper. */}
        <Animated.View
          entering={FadeIn.delay(550).duration(1000)}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <Image
            source={require("../../assets/mascot-reading.png")}
            style={{ width: MASCOT_W, height: MASCOT_H }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Auth tray — rises in last, rounded white card flush to the bottom. */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(800)}
        style={[
          softShadow,
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: Platform.OS === "ios" ? 40 : 28,
          },
        ]}
      >
        {/* Google — white face, official 4-colour mark, neutral dark label. */}
        <TouchableOpacity
          style={[
            softShadow,
            {
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e6e1d8",
              borderRadius: 14,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
          onPress={() =>
            google.mutate(undefined, {
              onError: (e) => setAuthError(e.message),
            })
          }
          disabled={google.isPending}
          activeOpacity={0.85}
        >
          {google.isPending ? (
            <ActivityIndicator color="#3c4043" />
          ) : (
            <>
              <Image
                source={require("../../assets/google-g.png")}
                style={{ width: 20, height: 20, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#3c4043" }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email — our plum outline with an envelope mark. */}
        <TouchableOpacity
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1.5,
            borderColor: colors.accent,
            borderRadius: 14,
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 14,
          }}
          onPress={() => router.push("/(auth)/email")}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color={colors.accent}
            style={{ marginRight: 12 }}
          />
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.accent }}>
            Continue with email
          </Text>
        </TouchableOpacity>

        {authError && (
          <Text
            style={{
              fontSize: 13,
              color: colors.destructive,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            {authError}
          </Text>
        )}

        {/* Sprig divider */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 22,
            marginBottom: 14,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
          <MaterialCommunityIcons
            name="sprout"
            size={18}
            color={sage}
            style={{ marginHorizontal: 14 }}
          />
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        </View>

        {/* Terms — quiet grey with plum links. */}
        <Text
          style={{
            fontSize: 12.5,
            lineHeight: 19,
            textAlign: "center",
            color: colors.ink3,
          }}
        >
          By continuing, you agree to our{" "}
          <Text style={{ color: colors.accent }}>Terms of Service</Text>
          {"\n"}and acknowledge our{" "}
          <Text style={{ color: colors.accent }}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
