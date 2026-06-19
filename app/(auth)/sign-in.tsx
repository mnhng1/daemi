import {
  View,
  Text,
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
import { Ionicons } from "@expo/vector-icons";
import { useGoogleSignIn } from "../../src/features/auth";
import { colors, fonts, cardShadow } from "../../src/lib/theme/tokens";
import { Sticker } from "../../src/components/ui/sticker";

// A soft, paper-friendly version of the card shadow for the floating bits.
const softShadow = {
  shadowColor: "#46301c",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 2,
} as const;

// One small instax-style tile for the centre filler strip.
function MiniTile({
  rotate,
  caption,
  marginLeft = 0,
}: {
  rotate: number;
  caption: string;
  marginLeft?: number;
}) {
  return (
    <View
      style={[
        cardShadow,
        {
          width: 60,
          height: 72,
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
      <Text
        style={{
          fontFamily: fonts.hand,
          fontSize: 11,
          color: colors.ink3,
          textAlign: "center",
          marginTop: 2,
        }}
      >
        {caption}
      </Text>
    </View>
  );
}

export default function SignIn() {
  const [authError, setAuthError] = useState<string | null>(null);
  const google = useGoogleSignIn();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* Decorative collage — non-interactive, behind wordmark. Each piece
          fades in on a small stagger so the scrapbook "assembles" itself. */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Photo tile — top-left, tilted slightly clockwise */}
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
            },
          ]}
        >
          {/* Faux photo image area */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.shade,
              borderRadius: 3,
              marginBottom: 8,
            }}
          />
          {/* Caveat caption */}
          <Text
            style={{
              fontFamily: fonts.hand,
              fontSize: 13,
              color: colors.ink3,
              textAlign: "center",
            }}
          >
            golden hour
          </Text>
        </Animated.View>

        {/* Letter snippet — top-right, tilted counter-clockwise */}
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
              padding: 12,
              paddingTop: 14,
            },
          ]}
        >
          {/* Ruled lines */}
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                height: 1,
                backgroundColor: colors.line,
                marginBottom: 13,
              }}
            />
          ))}
          {/* Caveat handwriting line */}
          <Text
            style={{
              fontFamily: fonts.hand,
              fontSize: 12,
              color: colors.ink3,
              position: "absolute",
              top: 20,
              left: 12,
            }}
          >
            thinking of you...
          </Text>
        </Animated.View>

        {/* Ticket stub — middle-right, barely tilted */}
        <Animated.View
          entering={FadeIn.delay(410).duration(800)}
          style={[
            cardShadow,
            {
              position: "absolute",
              top: Platform.OS === "ios" ? 230 : 210,
              right: 36,
              width: 90,
              height: 44,
              backgroundColor: colors.accentSoft,
              borderRadius: 6,
              transform: [{ rotate: "-3deg" }],
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 10,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 10,
              color: colors.accent,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            admit two
          </Text>
          <View
            style={{
              height: 1,
              backgroundColor: colors.accent,
              opacity: 0.25,
              width: "100%",
              marginTop: 4,
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
              top: Platform.OS === "ios" ? 260 : 240,
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
            style={{
              flex: 1,
              backgroundColor: colors.shade,
              borderRadius: 2,
            }}
          />
        </Animated.View>

        {/* Stickers */}
        <Animated.View entering={FadeIn.delay(680).duration(700)}>
          <Sticker
            text="us"
            rotate={-8}
            top={Platform.OS === "ios" ? 195 : 175}
            left={68}
          />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(760).duration(700)}>
          <Sticker
            text="est. 2024"
            rotate={5}
            top={Platform.OS === "ios" ? 345 : 325}
            left={40}
            color={colors.accentSoft}
          />
        </Animated.View>
      </View>

      {/* Wordmark + tagline + centre filler */}
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
          style={{
            fontFamily: fonts.display,
            fontSize: 72,
            // Generous line height + vertical padding so Caveat's tall "i" dot
            // and descenders aren't clipped by the text box.
            lineHeight: 100,
            paddingTop: 6,
            includeFontPadding: true,
            textAlign: "center",
            color: colors.accent,
          }}
        >
          daemi
        </Animated.Text>
        <Animated.Text
          entering={FadeIn.delay(560).duration(800)}
          style={{
            fontFamily: fonts.ui,
            fontSize: 16,
            color: colors.ink3,
            marginTop: 2,
          }}
        >
          your shared scrapbook
        </Animated.Text>

        {/* Centre filler — a little instax strip to ground the empty middle */}
        <Animated.View
          entering={FadeInUp.delay(860).duration(800)}
          style={{ marginTop: 34, alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MiniTile rotate={-7} caption="mar" />
            <MiniTile rotate={4} caption="jul" marginLeft={-10} />
            <MiniTile rotate={-3} caption="dec" marginLeft={-10} />
          </View>
          <Text
            style={{
              fontFamily: fonts.hand,
              fontSize: 17,
              color: colors.ink3,
              marginTop: 16,
            }}
          >
            a year of us, in one place
          </Text>
        </Animated.View>
      </View>

      {/* Bottom tray — faked frosted panel. Rises in last so the very first
          thing you see is the scrapbook, not a wall of buttons. */}
      <Animated.View
        entering={FadeInUp.delay(1150).duration(750)}
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
        {/* Google button — kept in Google's own light style (white surface,
            neutral border, brand "G", system font) rather than our theme. */}
        <TouchableOpacity
          style={[
            softShadow,
            {
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#dadce0",
              borderRadius: 12,
              paddingVertical: 13,
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
              <Ionicons
                name="logo-google"
                size={20}
                color="#4285F4"
                style={{ marginRight: 12 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: "#3c4043",
                  fontWeight: "600",
                }}
              >
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Email secondary button */}
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
          <Text
            style={{
              fontFamily: fonts.ui,
              fontSize: 16,
              color: colors.accent,
            }}
          >
            Continue with email
          </Text>
        </TouchableOpacity>

        {/* Error region */}
        {authError && (
          <Text
            style={{
              fontFamily: fonts.ui,
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
