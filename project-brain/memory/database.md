# Database Specifications

Data is stored as local constants inside `app.js`.

## Primary Databases
1. **`EV_DATABASE`**:
   - Holds structured definitions for all vehicles (brand, name, starting price, battery capacity, range, torque, safety NCAP rating, variants, features list, and expert ratings).
2. **`GUIDE_DATABASE`**:
   - Contains EV Buying Guide chapters, summaries, visual inline SVG diagrams, and technical term logs with simple explanations and analogies.
3. **`GUIDE_DETAILS_EXTENDED`**:
   - Maps guide slugs and hub keys to extensive features, benefits, steps lists, FAQs, and article recommendation arrays.
4. **`wishlistIds`**:
   - Tracks IDs of cars bookmarked by the user (session-only, in-memory array constant, not persisted in browser's `localStorage`).
5. **Brand Directory Collections (`SUPPORTED_BRANDS`, `INTERNATIONAL_BRANDS`)**:
   - Holds identifiers, names, and origins for 21 national-presence brands and 33 global manufacturers.
6. **`BrandDataService` (Database Abstraction Layer)**:
   - Encapsulates queries to `EV_DATABASE` for a given brand ID, preparing the codebase to bind to the CarsXE API asynchronously in the future without layout modifications.
