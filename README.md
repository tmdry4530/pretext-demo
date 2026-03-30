# Pretext Demo — Velocity Fields for Language

A cinematic showcase for [`@chenglou/pretext`](https://github.com/chenglou/pretext) built to feel less like a utility demo and more like a high-end interactive title sequence.

## What it is

This version turns the page into a spatial field where moving objects, shockwaves, and architectural channels continuously force a paragraph to recompute itself.

Instead of asking the DOM what happened after render, the layout is determined proactively with Pretext:

- prepare text once
- compute the available width for each next line
- route the paragraph around moving geometry
- render the result directly to canvas

## Showcase modes

- **Interceptor** — a high-speed energy craft slices through the paragraph
- **Slipstream** — orbital motion and stacked shockwaves create cascading splits
- **Neon Cathedral** — luminous structural lanes carve the text into architectural columns

## Why this is stronger

The previous iteration proved that text could bend around geometry.

This iteration aims for something more ambitious:

> make Pretext look like the core engine behind a cinematic, product-grade, spatial typography system.

It is designed to be:

- more memorable in screenshots and video captures
- more legible as a product/engine demo
- closer in feel to creative-coding and premium landing-page references

## Technical core

The important flow remains the same:

1. `prepareWithSegments(text, font)` once
2. compute blocked horizontal intervals from moving objects and scene structures
3. derive the best available segment for the current line
4. call `layoutNextLine(prepared, cursor, availableWidth)`
5. render the line and continue

That means the spectacle is still powered by the same key idea:

**deterministic multiline layout through changing space.**

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

- move pointer: steer the active scene
- `←` / `→`: switch modes
- `Space`: toggle autoplay
- HUD buttons: jump directly to a preset
