import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { queryClient } from "../../lib/query/client";

export function useSignOut() {
  return useMutation({
    mutationFn: () => supabase.auth.signOut().then(({ error }) => {
      if (error) throw error;
    }),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
