import { useMemo } from "react";
import { useCollections } from "./use-collections";

export function useAnniversaryMonth(spaceId: string | undefined): number | null {
  const { data: collections } = useCollections(spaceId);
  return useMemo(() => {
    if (!collections) return null;
    const anniv = collections.find((c) => c.type === "anniversary" && c.start_date);
    if (!anniv || !anniv.start_date) return null;
    // start_date is a "YYYY-MM-DD" date string; parse month (0-indexed)
    return new Date(anniv.start_date + "T00:00:00").getMonth();
  }, [collections]);
}
