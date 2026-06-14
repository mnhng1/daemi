// Deterministic scrapbook tilt — ports prototype `tilt(id, factor)` (04-timeline.js:79).
// Hashes the id to a stable value in [-3, 3] then scales by `factor`, yielding a
// small rotation (degrees) so each card leans slightly without ever shifting on re-render.
export function tilt(id: string, factor = 1): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 7;
  return (h - 3) * factor;
}
