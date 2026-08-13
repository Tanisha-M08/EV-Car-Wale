# Client-Side Routing

The routing architecture relies on URL hashes to map SPA page views.

## Route Definitions
- **`#/` (or empty)**: Main homepage showing popular/upcoming cars, and the savings calculator.
- **`#/cars/:id`**: Individual vehicle details page displaying variants, range calculator, expert reviews, and the apartment guide.
- **`#/guide/:id`**: Custom buyer guide subpage displaying diagrams and terms callouts.
- **`#/wishlist`**: Wishlisted vehicles catalog.
- **`#/news/all`**: EV news catalog.

## Flow
1. User interacts with UI (clicking navigation buttons, cards, or anchors).
2. The hash changes in the URL bar.
3. `handleRouting()` extracts the hash, looks up the parameter matching indices, dynamically rewrites the main content container, and sets scroll offsets to `(0, 0)`.
