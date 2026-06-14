import React from "react";
import { View } from "react-native";
import { SPINE_X } from "./layout";

// Prototype Spine (04-timeline.js:7-11): one continuous vertical line behind all
// rows, gradient accent → muted neutral. Implemented as stacked color segments
// (pure JS) to avoid a native gradient dependency. Bottom stop uses ink3 so the
// line stays clearly visible against the paper background.
const STOPS: { at: number; c: [number, number, number] }[] = [
  { at: 0, c: [0x8c, 0x5a, 0x7c] }, // accent
  { at: 0.3, c: [0xa9, 0x8a, 0x99] }, // muted blend
  { at: 1, c: [0x9a, 0x8e, 0x80] }, // ink3
];

function colorAt(t: number): string {
  let a = STOPS[0];
  let b = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (t >= STOPS[i].at && t <= STOPS[i + 1].at) {
      a = STOPS[i];
      b = STOPS[i + 1];
      break;
    }
  }
  const span = b.at - a.at || 1;
  const k = (t - a.at) / span;
  const ch = (i: number) => Math.round(a.c[i] + (b.c[i] - a.c[i]) * k);
  return `rgb(${ch(0)},${ch(1)},${ch(2)})`;
}

const SEGMENTS = 24;
const SEGMENT_COLORS = Array.from({ length: SEGMENTS }, (_, i) =>
  colorAt(i / (SEGMENTS - 1))
);

export function TimelineSpineLine() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: SPINE_X - 1,
        width: 2,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {SEGMENT_COLORS.map((color, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}
