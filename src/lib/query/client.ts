import { QueryClient, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// Wire NetInfo into TanStack Query's onlineManager so RQ pauses/resumes its
// own retries based on real connectivity — single source of truth.
onlineManager.setEventListener((setOnline) => {
  const unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null; isInternetReachable: boolean | null }) => {
    setOnline(
      state.isConnected === true && state.isInternetReachable !== false,
    );
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
