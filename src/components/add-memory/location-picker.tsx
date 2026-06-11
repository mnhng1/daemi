import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import * as Crypto from "expo-crypto";
import { colors } from "../../lib/theme/tokens";
import {
  usePlaceSearch,
  resolvePlaceDetails,
  type ResolvedPlace,
} from "../../features/places";

type LocationPickerProps = {
  spaceId: string | undefined;
  value: ResolvedPlace | null;
  onChange: (value: ResolvedPlace | null) => void;
};

export function LocationPicker({ spaceId, value, onChange }: LocationPickerProps) {
  const [query, setQuery] = useState(value?.place_name ?? "");
  const [focused, setFocused] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => Crypto.randomUUID());

  // The text that is currently committed (a selection or free-text). Used to
  // decide whether the suggestion list should show and whether blur should
  // re-commit free text.
  const committedTextRef = useRef<string | null>(value?.place_name ?? null);

  // True while a suggestion is being resolved, so a concurrent blur doesn't
  // commit the raw query as free text and clobber the pending selection.
  const resolvingRef = useRef(false);

  // Keep the input text in sync when `value` is set externally (incl. resets to null).
  useEffect(() => {
    if (value) {
      setQuery(value.place_name);
      committedTextRef.current = value.place_name;
    } else {
      setQuery("");
      committedTextRef.current = null;
    }
  }, [value]);

  const { data: suggestions } = usePlaceSearch(spaceId, query, sessionToken);

  const isCommitted = committedTextRef.current === query;
  const showSuggestions =
    focused && !isCommitted && !!suggestions && suggestions.length > 0;

  function rotateToken() {
    setSessionToken(Crypto.randomUUID());
  }

  async function handleSelect(placeId: string, description: string) {
    if (!spaceId) return;
    resolvingRef.current = true;
    try {
      const resolved = await resolvePlaceDetails(spaceId, placeId, sessionToken);
      // Details can return an empty name if Google has no displayName/address;
      // fall back to the suggestion description so we never commit a blank place.
      const place_name = resolved.place_name || description;
      const value: ResolvedPlace = { ...resolved, place_name };
      onChange(value);
      setQuery(place_name);
      committedTextRef.current = place_name;
    } catch {
      // Fall back to committing the description as free text.
      const fallback: ResolvedPlace = {
        place_name: description,
        latitude: null,
        longitude: null,
      };
      onChange(fallback);
      setQuery(description);
      committedTextRef.current = description;
    } finally {
      resolvingRef.current = false;
      setFocused(false);
      // A session token is one picking session and must not be reused.
      rotateToken();
    }
  }

  function commitFreeText() {
    if (resolvingRef.current) return;
    const text = query.trim();
    if (!text) return;
    if (committedTextRef.current === text) return;
    onChange({ place_name: text, latitude: null, longitude: null });
    committedTextRef.current = text;
  }

  function handleBlur() {
    setFocused(false);
    commitFreeText();
  }

  function handleClear() {
    setQuery("");
    committedTextRef.current = null;
    onChange(null);
    rotateToken();
  }

  return (
    <View>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          style={{
            backgroundColor: colors.shade,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingRight: query.length > 0 ? 40 : 16,
            paddingVertical: 14,
            color: colors.ink,
            fontSize: 16,
          }}
          placeholder="Add a place"
          placeholderTextColor={colors.ink3}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          onSubmitEditing={commitFreeText}
          returnKeyType="done"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            accessibilityLabel="Clear place"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              position: "absolute",
              right: 12,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.surface2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.ink2, fontSize: 14, lineHeight: 16 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <ScrollView
          style={{
            marginTop: 6,
            maxHeight: 220,
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions!.map((s) => (
            <TouchableOpacity
              key={s.placeId}
              onPress={() => handleSelect(s.placeId, s.description)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.shade,
              }}
              accessibilityLabel={`Select ${s.description}`}
            >
              <Text style={{ color: colors.ink, fontSize: 15 }}>{s.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
