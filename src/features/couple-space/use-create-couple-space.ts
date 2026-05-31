import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { supabase } from "../../lib/supabase/client";
import type { Database } from "../../types/database";

type CoupleSpaceInsert =
  Database["public"]["Tables"]["couple_spaces"]["Insert"];
type CoupleMemberInsert =
  Database["public"]["Tables"]["couple_members"]["Insert"];

function generateInviteCode(): string {
  const bytes = Crypto.getRandomBytes(8);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function useCreateCoupleSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name?: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Not authenticated");

      const inviteCode = generateInviteCode();

      const spaceInsert: CoupleSpaceInsert = {
        name,
        invite_code: inviteCode,
        created_by_user_id: user.id,
      };
      const { data: newSpace, error: spaceError } = await supabase
        .from("couple_spaces")
        .insert([spaceInsert])
        .select()
        .single();
      if (spaceError) throw spaceError;

      const memberInsert: CoupleMemberInsert = {
        couple_space_id: newSpace.id,
        user_id: user.id,
        role: "owner",
      };
      const { error: memberError } = await supabase
        .from("couple_members")
        .insert([memberInsert]);
      if (memberError) throw memberError;

      return newSpace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couple-space"] });
    },
  });
}
