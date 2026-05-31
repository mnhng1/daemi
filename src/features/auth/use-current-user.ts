import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useSession } from "./session-provider";

export function useCurrentUser() {
  const { session } = useSession();

  return useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session!.user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });
}
