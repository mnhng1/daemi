import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { isOnlineFromState } from "../../features/network";

// Wire NetInfo into TanStack Query's onlineManager so RQ pauses/resumes its
// own retries based on real connectivity — single source of truth. Reuse the
// shared isOnlineFromState predicate so this and useOnlineStatus can't drift.
onlineManager.setEventListener((setOnline) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setOnline(isOnlineFromState(state));
  });
  return unsubscribe;
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5,
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});
