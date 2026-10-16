# ShortIA Studio — Design System (DESIGN.md)
*Inspired by Linear.app, Raycast, and Vercel Design Standards*

## 1. Visual Theme & Atmosphere
- **Aesthetic**: Modern High-End Creative Studio. Dark-mode native, ultra-clean, dense yet breathable.
- **Mood**: Cinematic, confident, focused, tactile, and frictionless.
- **Surface Elevation Hierarchy**:
  - `Canvas / Background`: `#08090A` (Deep Obsidian Void).
  - `Surface 1 (Panels / Cards)`: `#0F1012` with 1px border `rgba(255, 255, 255, 0.07)`.
  - `Surface 2 (Elevated / Modals)`: `#15161A` with border `rgba(255, 255, 255, 0.12)`.
  - `Surface Interactive (Hover / Active)`: `#1B1D22` with border `rgba(255, 255, 255, 0.18)`.

## 2. Color Palette (Semantic Tokens)
- **Primary / Brand Gradient**: Linear Rose-Indigo (`#F43F5E` -> `#8B5CF6`).
- **Accent Emerald (Finance & Success)**: `#10B981` (Glows: `rgba(16, 185, 129, 0.15)`).
- **Accent Amber (Comics & Attention)**: `#F59E0B` (Glows: `rgba(245, 158, 11, 0.15)`).
- **Accent Rose (Character / Romance)**: `#EC4899` (Glows: `rgba(236, 72, 153, 0.15)`).
- **Text Levels**:
  - `Text Primary`: `#F8FAFC` (100% white-slate, crisp readability).
  - `Text Secondary`: `#94A3B8` (Subtle muted descriptions).
  - `Text Muted / Meta`: `#64748B` (Tags, timestamps, shortcuts).

## 3. Typography Rules (Vercel & Taste Standards)
- **Heading Balance**: Always use `text-wrap: balance` or `text-pretty` on all `<h1>` - `<h4>` to eliminate awkward line breaks and single-word orphans.
- **Punctuation**:
  - Use true typographic ellipsis `…` instead of three periods `...`.
  - Use typographic quotes `“` `”` and `‘` `’` for reflective editorial quotes.
- **Tabular Numerics**: Use `tabular-nums` on all counters, ratios, timers, and timestamps.
- **Weights**: Bold (700) for section titles; Medium (500) for interactive elements; Regular (400) for narrative copy.

## 4. Components & Buttons
- **Primary Action Pill**: Solid vibrant fill with subtle top-highlight border, micro-shadow:
  - `bg-gradient-to-r from-rose-500 via-indigo-600 to-purple-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all`
- **Secondary Ghost Action**:
  - `bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors`
- **Icon Buttons**: Always have `aria-label` or clear tooltip.
- **No Card Nesting Abuse**: Never nest cards more than 2 levels deep (avoid cards inside cards inside cards).

## 5. Micro-Interactions & Motion
- **Properties Animated**: Animate `transform` and `opacity` only (GPU accelerated, 60 FPS).
- **No `transition: all`**: Explicitly specify `transition-[transform,opacity,background-color]`.
- **Duration**: Fast, snappy feedback (`duration-150` for clicks, `duration-200` for hover states).
- **Mobile Touch**: Hit targets at least 44x44px.
