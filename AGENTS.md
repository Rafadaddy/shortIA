<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Design & Quality Rules (Taste-Skill + Vercel Web Guidelines)

## 1. Visual Source of Truth (`DESIGN.md`)
- Always inspect and respect `DESIGN.md` in root for color tokens, typography scales, and surface elevation ladders.
- Default to Linear / Raycast inspired high-end dark studio palette (`#08090A` canvas, 1px `#ffffff12` borders).

## 2. Image-First & Anti-Slop (Taste-Skill Core)
- **No AI Slop**: Avoid repetitive generic purple-gradient hero sections, centered 3-card templates, and endless nested cards.
- **Visual Balance**: Break monotony with intentional visual anchors (asymmetric layouts, refined glassmorphism, precise tag badges).
- **Tactile Feedback**: Interactive buttons must have distinct active (`active:scale-[0.98]`) and hover transitions.

## 3. Vercel Web Interface Standards
- **Typography**:
  - Always use `text-wrap: balance` or `text-pretty` on headings to prevent single-word orphans.
  - Use true typographic ellipsis `…` instead of `...`.
  - Use `tabular-nums` for timers, counts, and dates.
- **Animation**:
  - Never use `transition: all`. Explicitly name properties: `transition-[transform,opacity,background-color]`.
  - Animate `transform` and `opacity` only for compositor-friendly 60 FPS performance.
- **Accessibility & Focus**:
  - Icon-only buttons must have `aria-label`.
  - Visible focus rings with `focus-visible:ring-2 focus-visible:ring-indigo-500/50`.
  - `<button>` for actions, `<Link>` for navigation. Never `<div onClick>`.

