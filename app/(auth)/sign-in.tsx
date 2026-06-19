import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useGoogleSignIn } from "../../src/features/auth";
import { colors, fonts, cardShadow } from "../../src/lib/theme/tokens";
import { Sticker } from "../../src/components/ui/sticker";

// A soft, paper-friendly shadow for the buttons.
const softShadow = {
  shadowColor: "#46301c",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 2,
} as const;

// One quiet instax-style tile for the centre strip — no captions, just paper.
function MiniTile({ rotate, marginLeft = 0 }: { rotate: number; marginLeft?: number }) {
  return (
    <View
      style={[
        cardShadow,
        {
          width: 58,
          height: 70,
          marginLeft,
          backgroundColor: colors.surface,
          borderRadius: 4,
          transform: [{ rotate: `${rotate}deg` }],
          padding: 5,
          paddingBottom: 12,
        },
      ]}
    >
      <View style={{ flex: 1, backgroundColor: colors.shade, borderRadius: 2 }} />
    </View>
  );
}

export default function SignIn() {
  const [authError, setAuthError] = useState<string | null>(null);
  const google = useGoogleSignIn();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* Decorative collage — non-interactive, behind the wordmark. Paper
          objects, mostly wordless: the quiet, imperfect wabi-sabi feel. */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Photo tile — top-left */}
        <Animated.View
          entering={FadeIn.delay(150).duration(800)}
          style={[
            cardShadow,
            {
              position: "absolute",
              top: Platform.OS === "ios" ? 72 : 52,
              left: 28,
              width: 110,
              height: 126,
              backgroundColor: colors.surface,
              borderRadius: 6,
              transform: [{ rotate: "-5deg" }],
              padding: 8,
              paddingBottom: 18,
            },
          ]}
        >
          <View
            style={{ flex: 1, backgroundColor: colors.shade, borderRadius: 3 }}
          />
        </Animated.View>

        {/* Letter snippet — top-right */}
        <Animated.View
          entering={FadeIn.delay(280).duration(800)}
          style={[
            cardShadow,
            {
              position: "absolute",
              top: Platform.OS === "ios" ? 88 : 68,
              right: 24,
              width: 118,
              height: 108,
              backgroundColor: colors.surface,
              borderRadius: 6,
              transform: [{ rotate: "6deg" }],
              padding: 14,
            },
          ]}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                height: 1,
                backgroundColor: colors.line,
                marginBottom: 14,
              }}
            />
          ))}
        </Animated.View>

        {/* Ticket stub — middle-right */}
        <Animated.View
          entering={FadeIn.delay(410).duration(800)}
          style={[
            cardShadow,
            {
              position: "absolute",
              top: Platform.OS === "ios" ? 230 : 210,
              right: 36,
              width: 86,
              height: 42,
              backgroundColor: colors.accentSoft,
              borderRadius: 6,
              transform: [{ rotate: "-3deg" }],
              justifyContent: "center",
              paddingHorizontal: 12,
            },
          ]}
        >
          <View
            style={{
              height: 1,
              backgroundColor: colors.accent,
              opacity: 0.22,
              width: "100%",
            }}
          />
        </Animated.View>

        {/* Small polaroid tile — lower-left */}
        <Animated.View
          entering={FadeIn.delay(540).duration(800)}
          style={[
            cardShadow,
            {
              position: "absolute",
              top: Platform.OS === "ios" ? 262 : 242,
              left: 20,
              width: 80,
              height: 90,
              backgroundColor: colors.surface,
              borderRadius: 4,
              transform: [{ rotate: "4deg" }],
              padding: 6,
              paddingBottom: 16,
            },
          ]}
        >
          <View
            style={{ flex: 1, backgroundColor: colors.shade, borderRadius: 2 }}
          />
        </Animated.View>

        {/* A single small sticker, the one bit of warmth */}
        <Animated.View entering={FadeIn.delay(700).duration(700)}>
          <Sticker
            text="us"
            rotate={-8}
            top={Platform.OS === "ios" ? 200 : 180}
            left={70}
          />
        </Animated.View>
      </View>

      {/* Wordmark + quiet centre strip */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: 120,
        }}
      >
        <Animated.Text
          entering={FadeInDown.delay(180).duration(900)}
          numberOfLines={1}
          style={{
            fontFamily: fonts.display,
            fontSize: 72,
            // Room on all sides so Caveat's tall "i" dot and trailing glyph
            // ink aren't clipped vertically or horizontally.
            lineHeight: 100,
            paddingTop: 6,
            paddingHorizontal: 28,
            includeFontPadding: true,
            textAlign: "center",
            color: colors.accent,
          }}
        >
          daemi
        </Animated.Text>

        {/* Centre filler — a wordless instax strip to settle the middle */}
        <Animated.View
          entering={FadeInUp.delay(820).duration(800)}
          style={{ marginTop: 28, flexDirection: "row", alignItems: "center" }}
        >
          <MiniTile rotate={-7} />
          <MiniTile rotate={4} marginLeft={-10} />
          <MiniTile rotate={-3} marginLeft={-10} />
        </Animated.View>
      </View>

      {/* Bottom tray — rises in last so the scrapbook lands first, not the
          buttons. */}
      <Animated.View
        entering={FadeInUp.delay(1100).duration(750)}
        style={[
          cardShadow,
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(255,253,248,0.92)",
            borderTopWidth: 1,
            borderTopColor: colors.line,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === "ios" ? 44 : 28,
          },
        ]}
      >
        {/* Google — its own light style with the official 4-colour mark */}
        <TouchableOpacity
          style={[
            softShadow,
            {
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#dadce0",
              borderRadius: 12,
              paddingVertical: 14,
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
                style={{ width: 18, height: 18, marginRight: 12 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#3c4043" }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email — same type scale and weight as Google, just our outline */}
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: colors.accent,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            marginTop: 12,
          }}
          onPress={() => router.push("/(auth)/email")}
          activeOpacity={0.7}
        >
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
      </Animated.View>
    </SafeAreaView>
  );
}
