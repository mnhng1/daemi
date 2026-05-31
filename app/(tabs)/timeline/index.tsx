import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useSession, useSignOut } from "../../../src/features/auth";
import { useCurrentCoupleSpace } from "../../../src/features/couple-space";

export default function Timeline() {
  const { session } = useSession();
  const { data: coupleSpace } = useCurrentCoupleSpace();
  const signOut = useSignOut();

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text className="text-accent font-bold text-2xl mb-6">daemi</Text>

      <View className="bg-shade rounded-xl p-4 mb-4">
        <Text className="text-ink-3 text-xs uppercase tracking-wider mb-1">Signed in as</Text>
        <Text className="text-ink text-base">{session?.user.email}</Text>
      </View>

      {coupleSpace?.couple_spaces && (
        <View className="bg-shade rounded-xl p-4 mb-4">
          <Text className="text-ink-3 text-xs uppercase tracking-wider mb-1">Space</Text>
          <Text className="text-ink text-base mb-3">{coupleSpace.couple_spaces.name ?? "Unnamed space"}</Text>
          <Text className="text-ink-3 text-xs uppercase tracking-wider mb-1">Invite Code</Text>
          <Text className="text-ink text-base font-mono">{coupleSpace.couple_spaces.invite_code}</Text>
        </View>
      )}

      <TouchableOpacity
        className="bg-red-500 rounded-xl py-3.5 items-center mt-4"
        onPress={() => signOut.mutate()}
        disabled={signOut.isPending}
      >
        {signOut.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">Sign Out</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
