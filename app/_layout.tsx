import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  CormorantInfant_400Regular,
  CormorantInfant_400Regular_Italic,
  CormorantInfant_600SemiBold,
} from "@expo-google-fonts/cormorant-infant";
import { Caveat_400Regular, Caveat_700Bold } from "@expo-google-fonts/caveat";
import { PatrickHand_400Regular } from "@expo-google-fonts/patrick-hand";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { queryClient } from "../src/lib/query/client";
import { getAppearance } from "../src/lib/theme/tokens";
import { monochromeVars } from "../src/lib/theme/css-vars";
import { SessionProvider } from "../src/features/auth";
import { startQueueProcessor, setOnUploadComplete } from "../src/features/queue";
import { useCurrentCoupleSpace } from "../src/features/couple-space";
import { supabase } from "../src/lib/supabase/client";

SplashScreen.preventAutoHideAsync();

function QueueBoot() {
  const { data } = useCurrentCoupleSpace();
  const coupleSpaceId = data?.couple_spaces?.id;
  useEffect(() => {
    if (!coupleSpaceId) return;
    supabase.auth.getUser().then(({ data: authData }) => {
      const userId = authData.user?.id;
      if (!userId) return;
      setOnUploadComplete(() => queryClient.invalidateQueries({ queryKey: ["memories"] }));
      startQueueProcessor(coupleSpaceId, userId);
    });
  }, [coupleSpaceId]);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantInfant_400Regular,
    CormorantInfant_400Regular_Italic,
    CormorantInfant_600SemiBold,
    Caveat_400Regular,
    Caveat_700Bold,
    PatrickHand_400Regular,
    // Preload the icon glyph fonts too. Without this, vector-icon glyphs can paint
    // before their TTF is registered, so iOS lays them out with NaN metrics and logs
    // a burst of "[CoreGraphics] … NaN" / "CGPathCloseSubpath: no current point".
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  // Appearance (Scrapbook ↔ Monochrome) is read synchronously at boot by
  // tokens.ts. Read it ONCE here (not via the reactive store): a toggle persists +
  // fully reloads the bundle, so this re-evaluates at the next boot. Subscribing to
  // the store would re-render RootLayout on `set()` *before* the reload, flipping the
  // wrapper between plain/vars() and remounting <Slot/> mid-navigation — which throws
  // "Couldn't find a navigation context". Static read = wrapper mounts once, no remount.
  const monoVars = getAppearance() === "monochrome" ? monochromeVars : null;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <QueueBoot />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <View style={[{ flex: 1 }, monoVars]}>
              <Slot />
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </SessionProvider>
    </QueryClientProvider>
  );
}
