# Performance Review Protocol

Evaluates layout repaint profiles, calculations weights, and asset load speeds.

## Checklist
1. Are animations throttled using `requestAnimationFrame`?
2. Are DOM queries cached and run once per view render instead of inside scroll/drag handlers?
3. Did the code avoid heavy looping on data arrays?
