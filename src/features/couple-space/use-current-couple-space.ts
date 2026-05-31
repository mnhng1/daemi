import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useSession } from "../auth/session-provider";

export function useCurrentCoupleSpace() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["couple-space", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couple_members")
        .select("*, couple_spaces(*)")
        .eq("user_id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });
}
