import { useMutation } from "@tanstack/react-query";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../../lib/supabase/client";

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async () => {
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

      if (!iosClientId || !webClientId) {
        throw new Error("Google sign-in isn't set up yet");
      }

      GoogleSignin.configure({ iosClientId, webClientId });

      const response = await GoogleSignin.signIn();

      // User dismissed the Google sheet — not an error, just abort silently.
      if (response.type !== "success") {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error("Google sign-in did not return an ID token");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) throw error;
    },
  });
}
