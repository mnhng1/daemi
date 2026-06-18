// The Day/Month/Year zoom switcher UI was removed in favor of pinch-driven
// zoom (and the year-view month tap). This module now only exports the shared
// ZoomLevel type used by the timeline screen and aggregate views.
export type ZoomLevel = "day" | "month" | "year";
