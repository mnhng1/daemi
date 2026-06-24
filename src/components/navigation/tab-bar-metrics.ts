import { useSafeAreaInsets } from "react-native-safe-area-context";

// Height of the glass bar's interactive row (icons + FAB), excluding the safe
// area. Kept in sync with BAR_HEIGHT in bottom-tab-bar.tsx.
export const TAB_BAR_HEIGHT = 58;

// The glass bar now FLOATS over the scene (position: absolute) so content can
// scroll beneath the frosted blur — that translucency is what reads as glass.
// Scroll views must therefore reserve this much bottom space so their last item
// clears the bar instead of hiding under it. Mirrors the bar's own bottom pad
// (`Math.max(insets.bottom, 10)`), plus a little breathing room.
export function useTabBarSpace(extra = 16): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 10) + extra;
}
