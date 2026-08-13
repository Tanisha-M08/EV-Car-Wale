# Frontend Architecture

EVcarwale's frontend is designed around clean aesthetics, high responsiveness, and premium typography.

## UI Styling Layers
1. **Tailwind Play CDN**: Active on every page, styling layouts, flexgrids, margins, padding, colors, text alignments, and border transitions.
2. **Vanilla Custom CSS (`style.css`)**:
   - Faded section separators: Fades smoothly from `transparent` to soft charcoal (`#111111` at 6–10% opacity) and back to `transparent` (height `40-60px`, blur `20-30px`).
   - Custom transitions: Smooth hover effects on vehicle cards and navigation arrows.
3. **Typography**: Google Fonts (Plus Jakarta Sans and Inter) provide modern, high-end scannability.
