import { forwardRef, useImperativeHandle, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { normalizeTags } from "../../lib/utils/text";
import { colors } from "../../lib/theme/tokens";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
  placeholder?: string;
}

export interface TagInputHandle {
  /**
   * Commit any pending (typed-but-not-yet-entered) token and return the final
   * tag array synchronously. Call this from a save handler so a tag the user
   * typed without pressing space/comma/return is not silently dropped — the
   * returned value is safe to send to the mutation in the same tick.
   */
  flush: () => string[];
}

export const TagInput = forwardRef<TagInputHandle, TagInputProps>(function TagInput(
  {
    value,
    onChange,
    suggestions,
    max = 5,
    placeholder = "Add a tag...",
  },
  ref,
) {
  const [inputText, setInputText] = useState("");

  function mergeToken(raw: string): string[] {
    const token = raw.trim().replace(/^#/, "").toLowerCase();
    if (!token) return value;
    return normalizeTags([...value, token]);
  }

  function commitToken(raw: string) {
    const next = mergeToken(raw);
    if (next === value) return;
    onChange(next);
    setInputText("");
  }

  useImperativeHandle(
    ref,
    () => ({
      flush() {
        const next = mergeToken(inputText);
        if (next !== value) {
          onChange(next);
          setInputText("");
        }
        return next;
      },
    }),
    [inputText, value, onChange],
  );

  function handleChangeText(text: string) {
    // Commit on space or comma
    if (text.endsWith(" ") || text.endsWith(",")) {
      commitToken(text.slice(0, -1));
    } else {
      setInputText(text);
    }
  }

  function handleSubmitEditing() {
    commitToken(inputText);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  const visibleSuggestions = suggestions?.filter((s) => !value.includes(s)) ?? [];
  const atMax = value.length >= max;

  return (
    <View>
      {/* Current tags */}
      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
          contentContainerStyle={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}
        >
          {value.map((tag) => (
            <View
              key={tag}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.accent,
                borderRadius: 999,
                paddingLeft: 12,
                paddingRight: 8,
                paddingVertical: 6,
                minHeight: 32,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500", marginRight: 4 }}>
                {tag}
              </Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                accessibilityLabel={`Remove tag ${tag}`}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Text style={{ color: "#fff", fontSize: 13, lineHeight: 16 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Text input */}
      {!atMax && (
        <TextInput
          style={{
            backgroundColor: colors.shade,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: colors.ink,
            fontSize: 16,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.ink3}
          value={inputText}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          onBlur={handleSubmitEditing}
          returnKeyType="done"
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}
      {atMax && (
        <Text style={{ color: colors.ink3, fontSize: 12, marginTop: 4 }}>
          Maximum {max} tags
        </Text>
      )}

      {/* Suggestions */}
      {visibleSuggestions.length > 0 && !atMax && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ flexDirection: "row", gap: 6 }}
        >
          {visibleSuggestions.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onChange(normalizeTags([...value, s]))}
              style={{
                backgroundColor: colors.surface2,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                minHeight: 32,
                justifyContent: "center",
              }}
              accessibilityLabel={`Add tag ${s}`}
            >
              <Text style={{ color: colors.ink2, fontSize: 13, fontWeight: "500" }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
});
