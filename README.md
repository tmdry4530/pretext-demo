# Pretext — Deterministic Layout Before Paint

This demo is designed as a pitch-grade visual for `@chenglou/pretext`.

## Thesis

Pretext gives software a missing primitive:

**deterministic multiline layout before paint**.

That means text can route around changing geometry without waiting for the DOM to measure what already happened.

## Why it matters

This is useful anywhere interfaces combine text with motion or non-DOM rendering:

- AI canvases and generated media
- design tools and editors
- dashboards with live charts and overlays
- immersive brand systems and editorial experiences

## What the demo shows

- a paragraph is prepared once
- each frame computes a new available width for the next line
- the paragraph reflows around a moving portal-like geometry field
- the result is rendered directly to canvas

The point is not just spectacle.

The point is that the layout remains intentional while the scene changes.

## Run

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
