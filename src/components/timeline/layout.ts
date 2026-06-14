// Shared timeline layout constants (prototype 04-timeline.js:5).
// The gradient spine x MUST equal the node centers, so both derive from these.
export const DATE_W = 46; // right-aligned date column
export const NODE_W = 20; // node column (node centered within)
export const CONNECTOR_W = 14; // dashed connector between node and card

// x of node centers / spine, measured from the scroll content's left edge (paddingLeft:0)
export const SPINE_X = DATE_W + NODE_W / 2; // 56
