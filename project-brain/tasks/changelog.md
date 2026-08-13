# Changelog

All codebase changes sorted in reverse chronological order.

## [2026-07-01]
- **Extended EV Brands Directory**: Added a new section for 33 International Brands as pill buttons, styled premium grayscale.
- **Abstracted Database Queries (`BrandDataService`)**: Added a database query service class in `app.js` to handle brand vehicle list fetches asynchronously, creating a decoupled path for CarsXE API integration.
- **Implemented Search & Filters Submit**: Rebuilt `/brands` filter panel with explicit Search and Reset actions (Enter key listeners + click submit buttons) to show matching vehicles.
- **Enriched Card Specifications Grid**: Modified `getSpecGridHtml()` to render Seating Capacity and Body Type directly on vehicle cards.
- **Handled Brand Details Edge Cases**: Brand details views now show clean letters if logos are missing, and show a dedicated integration placeholder message if the brand has no models.
- **Generated Codebase Intelligence Documentation**: Created six core documentation files (`memory.md`, `architecture.md`, `routes.md`, `api-map.md`, `database-map.md`, `dependency-graph.md`) directly in the workspace root.
- **Identified Wishlist Persistence Bug**: Found that `wishlistIds` is an in-memory session array only, rather than a `localStorage` backed array as previously stated in internal documentation.
- **Updated Project Brain Memory**: Synchronized the verified wishlist array details in `project-brain/memory/database.md`.

## [2026-06-27]
- **Initialized Project Brain v2**: Bootstrapped directory layout containing system, memory, graph, runtime, standards, reviews, tasks, and cache layers.
- **Added Apartment Charging Guide**: Integrated jsPDF CDN, checklist boxes, toggles, and PDF NOC letter downloads.
- **Added Technical Spec Explains**: Integrated modal explanations for specs like Battery Capacity, Torque, kWh, and Ground Clearance.
- **Added Highway Readiness Rating**: Integrated dynamic status badges (🟢 Highway Ready, 🟡 Mixed Use, 🔴 City Commuter) with detailed DC charging specs and recommendations inside details specifications table and Compare Cars rows.


