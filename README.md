# Pretext Demo — Layout Engine for Moving Interfaces

This is a pitch-grade showcase for [`@chenglou/pretext`](https://github.com/chenglou/pretext).

Instead of presenting Pretext as a text utility, this demo frames it as a missing primitive for modern software:

> deterministic multiline layout before paint.

That matters anywhere text must coexist with motion, geometry, or non-DOM rendering.

## Product thesis

Pretext enables interfaces where text can be routed through changing space without relying on DOM measurement loops.

In practice, that means:

- AI canvases can place copy around generated objects before paint
- dashboards can keep annotations legible around live charts and widgets
- editors can support richer layout behaviors in canvas/SVG environments
- brand and editorial systems can treat text as part of the motion system, not an afterthought

## What the demo proves

A paragraph is prepared once with `prepareWithSegments()` and then re-laid out line-by-line with `layoutNextLine()` as geometry changes.

The visual result is cinematic, but the underlying proof is practical:

- **no DOM reads for paragraph height**
- **line-specific widths per frame**
- **renderer independence**
- **predictable text flow under motion**

## Modes

- **Investor Reveal** — the core thesis: moving geometry forces instant re-layout
- **AI Interface** — frames the engine for AI canvases, tools, and dynamic UI
- **Brand System** — frames the engine for immersive publishing and identity systems

## Why this version is better

Previous iterations were visually interesting but too abstract and too copy-heavy.

This version is designed to answer, within a few seconds:

1. what Pretext is
2. why it matters
3. where it can win
4. what makes the underlying engine special

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

- move pointer: steer the scene
- `←` / `→`: switch modes
- `Space`: toggle autoplay
- HUD buttons: jump directly to a preset
