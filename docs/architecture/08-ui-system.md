# UI System Architecture

## Visual Direction

Daemi should feel:

- warm
- private
- scrapbook-like
- cute
- clean
- not childish
- not dashboard-like

## Design Tokens

```ts
export const colors = {
  ink: "#2a2520",
  ink2: "#5a4f44",
  ink3: "#9a8e80",
  paper: "#faf6ef",
  shade: "#f1ead9",
  accent: "#8c5a7c",
  accentSoft: "#ead4df",
  highlight: "#f5e6b0",
};
```

## Core UI Components

```txt
Button
TextField
Sheet
Chip
MetaPill
Sticker
Card
Toast
EmptyState
LoadingState
ErrorState
```

## Memory Components

```txt
PhotoMemoryCard
LetterMemoryCard
VideoMemoryCard
TicketMemoryCard
PhotoMemoryDetail
LetterMemoryDetail
VideoMemoryDetail
TicketMemoryDetail
```

## Timeline Components

```txt
Spine
Node
TimelineRow
TimelineDateLabel
TodayCap
ZoomBar
```

## Form Components

```txt
Field
MetaRow
TagInput
DatePickerField
MediaPickerField
```

## Motion

MVP:

- sheet slide-up
- toast fade/slide
- card press feedback

Later:

- timeline zoom snap
- new memory sparkle
- letter seal animation
- pinch-to-zoom
