import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { queryClient } from "../../lib/query/client";
import { useSession } from "../auth/session-provider";

type ProfileUpdate = {
  display_name?: string | null;
  avatar_url?: string | null;
};

/**
 * Update the current user's own `profiles` row (display_name and/or avatar_url).
 * RLS `profiles_update USING (auth.uid() = id)` ensures a user can only edit their
 * own row. On success, invalidates the `useCurrentUser` query so the UI re-fetches.
 */
export function useUpdateProfile() {
  const { session } = useSession();

  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      const userId = session?.user.id;
      if (!userId) throw new Error("Not signed in");

      const { data, error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", session?.user.id] });
    },
  });
}
