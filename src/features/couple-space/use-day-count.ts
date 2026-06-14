import { useCurrentCoupleSpace } from "./use-current-couple-space";

// "day N" since the couple space was created (prototype header sub `day {N}`,
// 04-timeline.js:329). The prototype's miles-apart half is omitted — no location data.
// Day of creation is day 1.
export function useDayCount(_spaceId?: string): number | null {
  const { data } = useCurrentCoupleSpace();
  const createdAt = data?.couple_spaces?.created_at;
  if (!createdAt) return null;

  const start = new Date(createdAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return days > 0 ? days : 1;
}
