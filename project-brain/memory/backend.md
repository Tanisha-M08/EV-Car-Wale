# Backend Architecture

EVcarwale operates as a serverless, client-side Single Page Application (SPA).

## Specifications
- **No API Backend**: The application has no server-side execution scripts.
- **In-Memory Data**: All vehicle specs, calculator parameters, and guide chapters reside inside local array constants inside `app.js`.
- **Client-Side Generation**: Documents (such as the RWA request PDF) are built on-the-fly inside the user's browser using `jsPDF` without server involvement.
