# System Architecture: EVcarwale

EVcarwale is structured as a client-side Single Page Application (SPA) utilizing vanilla HTML, Tailwind CSS (loaded via CDN), and vanilla JavaScript.

## Codebase Modules
- **`index.html`**: Host page containing root sections, the header, search, video player, and info reader modals.
- **`style.css`**: Design tokens, faded section separators, custom animations, and scroll behaviors.
- **`app.js`**: Core driver containing the local databases, SPA routing engine, UI rendering functions, calculators, and PDF download triggers.

## Key Subsystems
1. **SPA Routing Engine**: Intercepts `DOMContentLoaded`, `hashchange`, and `popstate` events to run `handleRouting()`, which reads the current route (e.g. `#/cars/punch-ev` or `#/guide/guide-1`) and renders the view.
2. **Dynamic UI Recalculation**: Subpage elements (like details layouts and guide chapters) are rendered dynamically by rewriting the inner HTML. Event listeners are bound after each render.
3. **Modals Management**: Heavy reuse of `#modal-info-reader` for terms explainers, installation requirements, and text display.
