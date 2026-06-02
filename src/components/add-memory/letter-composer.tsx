import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../lib/theme/tokens";
import { wordCount } from "../../lib/utils/text";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const SCALE = SCREEN_W / 390;

const FONT_SIZE = Math.round(17 * SCALE);
const TEXT_LINE_HEIGHT = Math.round(FONT_SIZE * 1.65);
const RULED_GAP = TEXT_LINE_HEIGHT;
const MARGIN_LEFT = Math.round(44 * SCALE);
const PAD_H = Math.round(20 * SCALE);
const LINE_COUNT = Math.ceil((SCREEN_H * 1.5) / RULED_GAP);

// Align ruled lines with text baseline.
// lineHeight === RULED_GAP, so each text row is exactly one gap tall.
// The first ruled line sits at top = RULED_GAP (i=0 → RULED_GAP*1).
// We want row-0 text to land ON that line, meaning the text's baseline
// should coincide with top = RULED_GAP.  On iOS/Android, for a given
// lineHeight (L) and fontSize (F), the text cap-height occupies roughly
// the top 75% of the line box, so the baseline is at ≈ L * 0.75 from
// the top of each line box.  Therefore, paddingTop must push row-0 such
// that baseline0 = RULED_GAP:
//   paddingTop + L * 0.75 ≈ RULED_GAP  →  paddingTop ≈ RULED_GAP * 0.25
// Empirically the baseline rendered ~5% of a gap too low, so nudge up by 0.05.
const INPUT_PADDING_TOP = Math.round(RULED_GAP * 0.2);

interface Props {
  partnerName: string | null;
  authorName: string | null;
  isPending?: boolean;
  onSend: (body: string) => void;
  onCancel: () => void;
}

export function LetterComposer({
  partnerName,
  authorName,
  isPending,
  onSend,
  onCancel,
}: Props) {
  const to = partnerName?.toLowerCase() ?? "them";
  const from = authorName?.toLowerCase() ?? "me";
  const [body, setBody] = useState("");

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={12}>
          <Text style={styles.headerAction}>cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>to {to}</Text>
        <TouchableOpacity
          onPress={() => onSend(body)}
          disabled={isPending || !body.trim()}
          hitSlop={12}
          style={styles.sendBtn}
        >
          <Text
            style={[
              styles.headerAction,
              styles.headerSend,
              (isPending || !body.trim()) && styles.sendDisabled,
            ]}
          >
            {isPending ? "sending..." : "send"}
          </Text>
          {!isPending && (
            <MaterialCommunityIcons
              name="heart"
              size={Math.round(16 * SCALE)}
              color={!body.trim() ? colors.ink3 : colors.accent}
            />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.paper}>
            <View style={[styles.marginLine, { left: MARGIN_LEFT }]} />

            {Array.from({ length: LINE_COUNT }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.ruledLine,
                  { top: RULED_GAP * (i + 1), left: PAD_H, right: PAD_H },
                ]}
              />
            ))}

            <TextInput
              style={[
                styles.input,
                {
                  paddingLeft: MARGIN_LEFT + Math.round(14 * SCALE),
                  paddingRight: PAD_H,
                  paddingTop: INPUT_PADDING_TOP,
                  fontSize: FONT_SIZE,
                  lineHeight: TEXT_LINE_HEIGHT,
                },
              ]}
              multiline
              autoFocus
              scrollEnabled={false}
              textAlignVertical="top"
              placeholder={`dear ${to},`}
              placeholderTextColor={colors.ink3}
              selectionColor={colors.accent}
              cursorColor={colors.accent}
              onChangeText={setBody}
              value={body}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            — {from} · {wordCount(body)} words
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: colors.letterPaper,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PAD_H,
    paddingVertical: Math.round(14 * SCALE),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.ink4 + "44",
  },
  headerAction: {
    fontSize: Math.round(16 * SCALE),
    color: colors.ink2,
  },
  headerTitle: {
    fontSize: Math.round(19 * SCALE),
    fontFamily: "CormorantInfant_600SemiBold",
    color: colors.ink,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerSend: {
    fontWeight: "600",
    color: colors.accent,
  },
  sendDisabled: {
    color: colors.ink3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  paper: {
    flex: 1,
    minHeight: SCREEN_H,
    position: "relative",
  },
  marginLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.accent + "35",
  },
  ruledLine: {
    position: "absolute",
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.ink4 + "88",
  },
  input: {
    flex: 1,
    fontFamily: "CormorantInfant_400Regular_Italic",
    color: colors.ink,
  },
  footer: {
    paddingHorizontal: PAD_H,
    paddingVertical: Math.round(10 * SCALE),
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: Math.round(13 * SCALE),
    color: colors.ink3,
    fontFamily: "CormorantInfant_400Regular",
  },
});
