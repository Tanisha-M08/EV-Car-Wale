# Internal APIs & Interfaces

While there are no external network APIs, several critical internal helper functions drive core UI functionality.

## Core API Elements
1. **`getVehicleImages(car)`**: Asynchronously resolves local image path fallbacks for the car details slideshow.
2. **`downloadRWAPdf(carName)`**: Dynamically loads `jsPDF` from `window.jspdf`, constructs a printable RWA NOC request, and saves it locally.
3. **`animateSavingsNumber(elementId, targetValue)`**: Global helper that uses `requestAnimationFrame` to animate numerical savings counters dynamically over `300ms` when inputs change.
4. **`getHighwayReadinessData(car)`**: Resolves a vehicle's fast charging rating (Highway Ready, Mixed Use, City Commuter) based on charging durations.
5. **`getHighwayReadinessBadgeHtml(car)`**: Outputs the status badges, charging speeds, durations, and recommendations.
6. **`applyJargonBuster()`**: Global DOM scanner that searches raw text nodes under active views and wraps EV terms inside premium interactive tooltips.


