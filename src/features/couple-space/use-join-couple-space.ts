import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { Database } from "../../types/database";

type CoupleMemberInsert =
  Database["public"]["Tables"]["couple_members"]["Insert"];

export function useJoinCoupleSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const { data: spaceId, error: lookupError } = await supabase.rpc(
        "lookup_space_by_invite_code",
        { code: inviteCode.toUpperCase().trim() },
      );
      if (lookupError || !spaceId) throw new Error("Invalid invite code");

      const memberInsert: CoupleMemberInsert = {
        couple_space_id: spaceId,
        user_id: user.id,
        role: "member",
      };
      const { error: memberError } = await supabase
        .from("couple_members")
        .insert([memberInsert]);
      if (memberError) throw memberError;

      return { id: spaceId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couple-space"] });
    },
  });
}
