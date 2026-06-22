import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCurrentUser, useSignOut } from "../../../src/features/auth";
import {
  useCurrentCoupleSpace,
  usePartner,
  useDayCount,
} from "../../../src/features/couple-space";
import {
  useUpdateProfile,
  uploadAvatarImage,
  useAvatarUrl,
} from "../../../src/features/profile";
import { queryClient } from "../../../src/lib/query/client";
import { colors, fonts } from "../../../src/lib/theme/tokens";
import { useAppearanceStore } from "../../../src/lib/theme/appearance-store";
import type { Appearance } from "../../../src/lib/theme/palettes";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: fonts.ui,
        fontSize: 13,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: colors.ink3,
        marginBottom: 10,
        marginTop: 24,
      }}
    >
      {children}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}
    >
      <Text style={{ fontSize: 15, color: colors.ink2 }}>{label}</Text>
      <Text style={{ fontSize: 15, color: colors.ink, fontWeight: "600" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { data: currentUser } = useCurrentUser();
  const { data: membership } = useCurrentCoupleSpace();
  const { data: partnerName } = usePartner();
  const dayCount = useDayCount();
  const signOut = useSignOut();
  const updateProfile = useUpdateProfile();

  const appearance = useAppearanceStore((s) => s.appearance);
  const setAppearance = useAppearanceStore((s) => s.setAppearance);

  const coupleSpaceId = membership?.couple_spaces?.id;
  const space = membership?.couple_spaces;

  function chooseAppearance(a: Appearance) {
    if (a === appearance) return;
    Alert.alert(
      "Switch appearance?",
      "The app will reload to apply the new look.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Switch", onPress: () => setAppearance(a) },
      ]
    );
  }

  const { data: avatarUrl } = useAvatarUrl(coupleSpaceId, currentUser?.avatar_url);

  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Seed the field from the fetched profile until the user edits it.
  useEffect(() => {
    if (!nameTouched && currentUser?.display_name != null) {
      setName(currentUser.display_name);
    }
  }, [currentUser?.display_name, nameTouched]);

  async function pickAvatar() {
    if (!coupleSpaceId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? "image/jpeg";
    try {
      setAvatarUploading(true);
      const { key } = await uploadAvatarImage({ fileUri: asset.uri, coupleSpaceId, mimeType });
      await updateProfile.mutateAsync({ avatar_url: key });
      // Avatar keys are stable per user, so the cached presigned URL won't change on
      // its own — force a re-sign so the new image renders immediately.
      queryClient.invalidateQueries({ queryKey: ["avatar-url"] });
    } catch (err) {
      Alert.alert("Couldn't update photo", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveName() {
    try {
      await updateProfile.mutateAsync({ display_name: name.trim() || null });
      setNameTouched(false);
    } catch (err) {
      Alert.alert("Couldn't save", err instanceof Error ? err.message : "Please try again.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 34,
            color: colors.ink,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          You
        </Text>

        {/* ── Profile ─────────────────────────────────────────── */}
        <SectionTitle>Profile</SectionTitle>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Pressable
            onPress={pickAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            // Static style — css-interop's wrapped Pressable ignores the function form.
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            {avatarUploading ? (
              <ActivityIndicator color={colors.accent} />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96 }} />
            ) : (
              <MaterialCommunityIcons name="account" size={48} color={colors.ink3} />
            )}
          </Pressable>
          <Text style={{ fontFamily: fonts.ui, fontSize: 13, color: colors.ink3, marginTop: 8 }}>
            Tap to change photo
          </Text>
        </View>

        <Text style={{ fontSize: 14, color: colors.ink2, marginBottom: 6 }}>Display name</Text>
        <TextInput
          value={name}
          onChangeText={(t) => {
            setNameTouched(true);
            setName(t);
          }}
          placeholder="Your name"
          placeholderTextColor={colors.ink3}
          style={{
            fontSize: 16,
            color: colors.ink,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.line,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        />
        <Pressable
          onPress={saveName}
          disabled={updateProfile.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save display name"
          style={{
            marginTop: 12,
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingVertical: 13,
            alignItems: "center",
            opacity: updateProfile.isPending ? 0.6 : 1,
          }}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.surface }}>Save</Text>
          )}
        </Pressable>

        {/* ── Our Space ───────────────────────────────────────── */}
        <SectionTitle>Our Space</SectionTitle>
        <InfoRow label="Partner" value={partnerName ?? "—"} />
        <InfoRow label="Space" value={space?.name ?? "Untitled"} />
        {dayCount != null && <InfoRow label="Day" value={String(dayCount)} />}
        <InfoRow label="Invite code" value={space?.invite_code ?? "—"} />

        {/* ── Appearance ──────────────────────────────────────── */}
        <SectionTitle>Appearance</SectionTitle>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {(["scrapbook", "monochrome"] as Appearance[]).map((a) => {
            const active = appearance === a;
            return (
              <Pressable
                key={a}
                onPress={() => chooseAppearance(a)}
                accessibilityRole="button"
                accessibilityLabel={`Use ${a} appearance`}
                style={{
                  flex: 1,
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.line,
                  paddingVertical: 16,
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MaterialCommunityIcons
                  name={a === "scrapbook" ? "notebook-outline" : "contrast-box"}
                  size={22}
                  color={active ? colors.surface : colors.ink2}
                />
                <Text style={{ fontSize: 14, fontWeight: "600", color: active ? colors.surface : colors.ink }}>
                  {a === "scrapbook" ? "Scrapbook" : "Monochrome"}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontSize: 12, color: colors.ink3, marginTop: 8 }}>
          Switching reloads the app. Monochrome is a design preview of the same content.
        </Text>

        {/* ── Account ─────────────────────────────────────────── */}
        <SectionTitle>Account</SectionTitle>
        <Pressable
          onPress={() => signOut.mutate()}
          disabled={signOut.isPending}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={{
            marginTop: 4,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.line,
            paddingVertical: 13,
            alignItems: "center",
            opacity: signOut.isPending ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.destructive }}>
            {signOut.isPending ? "Signing out…" : "Sign out"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
