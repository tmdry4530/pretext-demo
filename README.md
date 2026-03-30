# Pretext Demo — Event Horizon Typography

A visually striking demo built on top of [`@chenglou/pretext`](https://github.com/chenglou/pretext).

## Concept

**Event Horizon Typography** turns Pretext's multiline layout engine into a motion graphic.

A single multilingual paragraph is measured once with Pretext, then re-laid out every frame so each line can have a **different usable width**. The text appears to bend around a moving black-hole-like singularity. This shows off one of Pretext's most interesting capabilities:

- not just measuring paragraph height
- not just wrapping text at a fixed width
- but **routing text line-by-line through changing geometry**

That is the core novelty here.

## Why this is a good demo for Pretext

Most text demos prove correctness. This one proves **expressiveness**.

Pretext's standout API for this is `layoutNextLine()`. It lets us ask:

> Given the current cursor in the paragraph, and a width for *this one line*, what is the next line?

That makes it possible to create layouts that are hard or awkward in normal DOM/CSS:

- text wrapping around shapes
- dynamic editorial layouts
- responsive canvas typography
- text flowing around animated objects

This demo is intentionally narrow and bold: one idea, rendered clearly.

## Fastest credible path I chose

After inspecting the repo, the fastest trustworthy route to a runnable standalone demo was:

1. use the published npm package `@chenglou/pretext`
2. create a tiny Vite app in this workspace
3. render to a single `<canvas>`
4. use `prepareWithSegments()` + `layoutNextLine()` for the core effect

Why this path:

- minimal setup friction
- no need to fork the original repo or its Bun devserver
- easy to run locally with standard Node/npm tooling
- keeps the demo focused on Pretext itself

## Files

- `index.html` — shell + HUD
- `main.js` — canvas rendering and Pretext layout logic
- `package.json` — minimal local runner

## Run locally

```bash
cd /Users/domclaw/.openclaw/workspace-hq/pretext-demo
npm install
npm run dev
```

Then open the local Vite URL, usually:

- `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Interaction

- Move the mouse or trackpad pointer to steer the gravity well
- Resize the window to see the paragraph reflow instantly

## Technical note

The important Pretext flow is:

1. `prepareWithSegments(text, font)` once
2. on every frame, compute the available width for the next line based on where the black hole cuts into the paragraph region
3. call `layoutNextLine(prepared, cursor, availableWidth)`
4. draw that returned line to canvas
5. continue until the paragraph is exhausted

That means the expensive text analysis is front-loaded, while frame-by-frame layout stays lightweight and geometric.

## What makes it novel

This is not a generic “text wraps around a circle” demo.

The novelty is the combination of:

- **animated geometry**
- **multilingual paragraph content**
- **canvas-native rendering**
- **no DOM measurement loop**
- **line-by-line adaptive layout as the visual effect itself**

It presents Pretext less as a utility and more as a **creative layout engine**.
