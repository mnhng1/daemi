import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useSession } from "../auth/session-provider";
import { useCurrentCoupleSpace } from "./use-current-couple-space";

export function usePartner() {
  const { session } = useSession();
  const { data: membership } = useCurrentCoupleSpace();
  const coupleSpaceId = membership?.couple_spaces?.id;

  return useQuery({
    queryKey: ["partner", coupleSpaceId, session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couple_members")
        .select("user_id")
        .eq("couple_space_id", coupleSpaceId!)
        .neq("user_id", session!.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user_id)
        .maybeSingle();
      if (pErr) throw pErr;
      return profile?.display_name ?? null;
    },
    enabled: !!coupleSpaceId && !!session,
  });
}
