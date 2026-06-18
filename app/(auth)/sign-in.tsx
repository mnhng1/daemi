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
import { useGoogleSignIn } from "../../src/features/auth";
import { colors, fonts, cardShadow } from "../../src/lib/theme/tokens";
import { Sticker } from "../../src/components/ui/sticker";

export default function SignIn() {
  const [authError, setAuthError] = useState<string | null>(null);
  const google = useGoogleSignIn();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* Decorative collage — non-interactive, behind wordmark */}
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* Photo tile — top-left, tilted slightly clockwise */}
        <View
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
        </View>

        {/* Letter snippet — top-right, tilted counter-clockwise */}
        <View
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
        </View>

        {/* Ticket stub — middle-right, barely tilted */}
        <View
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
        </View>

        {/* Small polaroid tile — lower-left */}
        <View
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
        </View>

        {/* Stickers */}
        <Sticker text="us" rotate={-8} top={Platform.OS === "ios" ? 195 : 175} left={68} />
        <Sticker
          text="est. 2024"
          rotate={5}
          top={Platform.OS === "ios" ? 345 : 325}
          left={40}
          color={colors.accentSoft}
        />
      </View>

      {/* Wordmark + tagline — center of screen */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 180,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 72,
            color: colors.accent,
            lineHeight: 76,
            letterSpacing: -1,
          }}
        >
          daemi
        </Text>
        <Text
          style={{
            fontFamily: fonts.ui,
            fontSize: 16,
            color: colors.ink3,
            marginTop: 4,
          }}
        >
          your shared scrapbook
        </Text>
      </View>

      {/* Bottom tray — faked frosted panel */}
      <View
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
        {/* Google primary button */}
        <TouchableOpacity
          className="bg-accent rounded-xl py-3.5 items-center"
          onPress={() =>
            google.mutate(undefined, {
              onError: (e) => setAuthError(e.message),
            })
          }
          disabled={google.isPending}
          activeOpacity={0.82}
        >
          {google.isPending ? (
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
              Continue with Google
            </Text>
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
      </View>
    </SafeAreaView>
  );
}
