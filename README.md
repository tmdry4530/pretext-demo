# Pretext Demo — Event Horizon Typography++

A showcase demo for [`@chenglou/pretext`](https://github.com/chenglou/pretext) that treats text layout as a programmable spatial system rather than a fixed DOM box.

## What changed

This upgraded version pushes the original idea into a more presentation-worthy direction:

- **three cinematic layout presets**
  - `Singularity`
  - `Binary Stars`
  - `Wormhole`
- **multilingual editorial copy** prepared once and re-laid out continuously
- **canvas-native visual system** with particles, glow fields, and reactive highlights
- **line-by-line geometry routing** driven by Pretext's `layoutNextLine()`
- **interactive HUD** for switching modes and autoplaying the scene

## Why this demo matters

Most typography demos show that text wraps correctly.

This one shows something more ambitious:

> Pretext can act like a real-time paragraph engine that routes language through changing geometry.

That means you can build experiences where text is not just placed after render, but actively computed as part of the scene:

- AI-native editors
- responsive data storytelling
- canvas/SVG interfaces
- text wrapping around live objects
- immersive brand or product sites

## Core technical idea

The key flow is:

1. `prepareWithSegments(text, font)` once
2. for each frame, compute which horizontal spans are blocked by spatial fields
3. derive the best available segment for the next line
4. call `layoutNextLine(prepared, cursor, availableWidth)`
5. draw the line, then continue until the paragraph is exhausted

This makes the layout:

- **predictable**
- **renderer-independent**
- **fast enough for motion graphics**
- **not dependent on DOM measurement loops**

## Files

- `index.html` — HUD, controls, and presentation shell
- `main.js` — field simulation, geometry routing, and canvas rendering
- `package.json` — minimal Vite runner

## Run locally

```bash
cd /Users/domclaw/.openclaw/workspace-hq/pretext-demo
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Controls

- move pointer: steer the active field
- `←` / `→`: switch presets
- `Space`: toggle autoplay
- buttons in the HUD: manually choose scenes

## Positioning

If you want to pitch Pretext to engineers, designers, founders, or investors, this demo positions it as:

**not a helper for text measurement, but a programmable engine for spatial typography.**
