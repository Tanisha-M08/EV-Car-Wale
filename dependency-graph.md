# EVcarwale Codebase Dependency Graph

This document details the modular relationships, script linkages, and selector dependencies across both frontend and backend directories.

---

## 1. Codebase Dependency Diagram

```mermaid
graph TD
    %% Server Tier
    server[server.js: Dev Server] -->|Requires| app_factory[backend/src/app.js: App Factory]
    api_entry[api/index.js: Vercel Entry] -->|Requires| app_factory
    
    app_factory -->|Serves| index_html[index.html: Client canvas]
    app_factory -->|Requires| api_router[backend/src/routes/index.js: Main API Router]
    
    %% API Routing Dependencies
    api_router -->|Mounts| auth_routes[authRoutes.js]
    api_router -->|Mounts| car_routes[carRoutes.js]
    api_router -->|Mounts| blog_routes[blogRoutes.js]
    api_router -->|Mounts| review_routes[reviewRoutes.js]
    api_router -->|Mounts| lead_routes[leadRoutes.js]
    api_router -->|Mounts| charger_routes[chargerRoutes.js]
    api_router -->|Mounts| news_routes[newsRoutes.js]
    api_router -->|Mounts| video_routes[videoRoutes.js]
    api_router -->|Mounts| chat_routes[chat controller]
    
    %% Backend Business Layer
    auth_routes -->|Uses| auth_controller[authController.js]
    auth_controller -->|Uses| user_service[userService.js]
    user_service -->|Uses| user_repo[userRepository.js]
    user_repo -->|Uses| dynamo_repo[dynamoRepository.js]
    
    %% Client Dependencies
    index_html -->|Loads CSS| style_css[style.css: Grayscale design]
    index_html -->|Loads script| env_js[env.js: Env configurations]
    index_html -->|Loads script| firebase_js[firebase.js: Client auth]
    index_html -->|Loads script| app_js[app.js: Core SPA driver]
    
    app_js -->|Queries / Mutates DOM| index_html
    app_js -->|Uses window.jspdf| jsPDF[jsPDF CDN]
    app_js -->|Calls API| api_router
    
    classDef client fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    classDef server fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    class index_html,style_css,env_js,firebase_js,app_js,jsPDF client;
    class server,api_entry,app_factory,api_router,auth_routes,car_routes,blog_routes,review_routes,lead_routes,charger_routes,news_routes,video_routes,chat_routes,auth_controller,user_service,user_repo,dynamo_repo server;
```

---

## 2. Structural Dependencies

### A. HTML to JS DOM Selectors
The frontend driver (`app.js`) is heavily coupled with selector IDs and CSS classes inside `index.html`. Removing or renaming these elements will break frontend execution:

| Selector Key (ID / Class) | Type | Responsible JS Subsystem | Result of Modification / Removal |
| :--- | :--- | :--- | :--- |
| `#homepage-content` | Div | `restoreHomepage()`, `handleRouting()` | The main homepage dashboard fails to show/hide. |
| `#details-page-content` | Div | `renderCarDetailsPage()`, `handleRouting()` | Car details template injection breaks, halting subpage renders. |
| `#preloader` / `#loader-progress` | Div | `runPreloader()` | Startup loader screen hangs. |
| `#slider-price` / `#slider-down` | Slider | `updateEMICalculator()` | Loan EMI amortization calculations fail. |
| `#savings-select-ev` | Select | `updateLandingSavings()` | Fuel savings engine fails to load EV efficiency indices. |
| `.jargon-term` | Class | `applyJargonBuster()` | Custom tooltip bindings for EV terminology fail. |
| `.variant-tab-btn` | Class | `renderCarDetailsPage()` | In-page variant trim calculations break. |

### B. Backend Configurations & Environment Keys
The Express server depends on configuration models in `backend/src/config/`:
- **`env.js`**: Validates keys and exposes options to the server runtime.
- **`aws.js`**: Initializes DynamoDB and S3 clients.
- **`firebaseAdmin.js`**: Reads service keys to configure Google token verification.

---

## 3. High Impact Files (Modify with Caution)

1. **[app.js](file:///Users/tanisha/Documents/EVcarwale/app.js) (Critical Client Impact)**:
   Contains all static catalogs, range math formulas, RWA letter specifications, SPA routing paths, and event registrations. Single-character syntax issues will break the entire client experience.
2. **[backend/src/app.js](file:///Users/tanisha/Documents/EVcarwale/backend/src/app.js) (Critical Backend Impact)**:
   Initializes CORS, body parsing limits, and routing mount pathways. Changes here can break REST communications.
3. **[index.html](file:///Users/tanisha/Documents/EVcarwale/index.html) (High Client Impact)**:
   Defines the markup containers (homepage, detail page, modal windows). Modifying structural layouts will break element bindings in `app.js`.
4. **[backend/src/repositories/dynamoRepository.js](file:///Users/tanisha/Documents/EVcarwale/backend/src/repositories/dynamoRepository.js) (High Database Impact)**:
   Standardizes CRUD execution paths for DynamoDB. A bug introduced here will cascade to all data endpoints, blocking profile syncs, test drive lead bookings, and reviews.
