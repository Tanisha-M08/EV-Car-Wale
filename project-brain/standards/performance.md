# Performance Standards

Guidelines for keeping DOM interactions fast and minimizing calculations.

## Guidelines
1. **Throttling & Animation**: Use `requestAnimationFrame` for scrolling or counter animations (like numeric savings).
2. **DOM Queries**: Cache selector references (like `document.getElementById`) inside setup blocks instead of querying them repeatedly on every scroll event.
3. **Asset Weights**: Keep images optimized and load dependencies via fast CDNs.
