# Project Memory & Codebase Intelligence: EV Car Wale

This document is the permanent brain of the **EV Car Wale** project. It is designed so that a completely new engineer can understand what the project does, why it exists, how it works, how data flows, how the frontend and backend communicate, how routing works, how authentication works, how state is managed, how APIs work, how deployment works, and how every major feature operates — all in one place.

Companion documents: [`database-map.md`](../database-map.md), [`architecture.md`](../architecture.md), [`api-map.md`](../api-map.md), [`routes.md`](../routes.md), [`dependency-graph.md`](../dependency-graph.md).

> **Maintenance rule:** Update this file whenever the architecture, routes, schemas, or deployment process change. Keep facts, not opinions.

---

## Table of Contents

1. Project Overview & Business Purpose
2. Technology Stack
3. Repository Structure
4. System Architecture
5. Routing Intelligence
6. Frontend Architecture
7. Backend Architecture
8. Database Intelligence
9. Data Flow Analysis
10. Dependency Graph
11. Authentication & Authorisation
12. Environment & Configuration
13. Calculator Math Engines
14. Feature Inventory
15. Performance Analysis & Technical Debt
16. Development & Deployment Workflow
17. Current Known Issues

---

## 1. Project Overview & Business Purpose

### What the project is
**EV Car Wale** (`evcarwale.com`) is India's smart electric vehicle (EV) marketplace. It is a **hybrid application**: a single‑page‑application (SPA) shell (`index.html` + monolith `app.js`) that hosts most routes through hash navigation, supplemented by ~20 standalone HTML pages (about, compare, profile, calculators, guides, legal). The backend is a Node.js + Express service that provides persistence (Amazon DynamoDB), object storage (S3), authentication verification (Firebase Admin / Passport‑Google), and SRP for third‑party APIs (news, videos, chargers, translation, AI chat).

### Business problem solved
Indian buyers face informational barriers to EV adoption: range anxiety, opaque pricing, confusing charging infrastructure, and doubts about home/RWA charging. EV Car Wale removes these by providing:
- A searchable / filterable catalog of electric vehicles sold in India (84 models).
- Interactive calculators: **EV Trip & Charging Planner**, **EMI**, **Running‑Cost / Petrol‑vs‑EV savings**, **Charging‑Time**, and **On‑Road Price**.
- A charging‑station finder using the Open Charge Map API + a static fallback dataset.
- Educational content: guides, knowledge‑hub articles, news, blogs, videos, FAQs.
- An **AI assistant** (Gemini‑powered) for EV‑related questions.
- Conversion tools: apartment‑society NOC letter generator (jsPDF), test‑drive booking, newsletter signup.
- Google sign‑in with wishlists (favourites) and recently‑viewed persistence.

### Primary entities
**Cars** (static JSON), **Users** (DynamoDB), **Favourites**, **RecentlyViewed**, **TestDriveRequests**, **NewsletterSubscriptions**, **Reviews**, **Blogs**, **ChatHistory**, **UserPreferences**, **Notifications**, **Payments** (placeholder).

### User workflow
1. **Land & search**: Hero search by name / brand / budget; browse carousels (Popular, Upcoming, Launches); browse by brand chips / budget cars.
2. **Analyse / tools**: Trip Planner, EMI, Petrol Savings, Charging Time, Charging Station Finder.
3. **Discover detail page**: click a car card → full spec, variants, on‑road price breakdown, colour gallery, related cars.
4. **Act**: book test drive, download RWA NOC letter, subscribe to newsletter, add to wishlist (login optional).
5. **Consume content**: news, blogs, videos, guides, plus FAQ and testimonials.
6. **AI consultation**: chat with the EV assistant.

---

## 2. Technology Stack

| Layer | Technology | Notes / Location |
| :--- | :--- | :--- |
| **Frontend** | Vanilla HTML5 + Vanilla ES6 JS (zero build) | `index.html`, `app.js` (~1 MB, 19,644 lines), `ai-assistant.js`, `auth-helper.js`, `videoIntegration.js` |
| **Styling** | Tailwind CSS via Play CDN + custom `style.css` | Monochrome black/zinc theme, Poppins & Space Grotesk fonts, EV green accent `#22C55E` |
| **Backend** | Node.js + Express (`express@5`) | `backend/src/app.js` factory `createApp()`; also root `server.js` & Vercel `api/index.js` |
| **Database** | Amazon DynamoDB (single‑table `pk`/`sk` design) | `backend/src/config/aws.js`, generic `dynamoRepository.js` |
| **Storage** | Amazon S3 (`ev-car-wale` bucket, public base `https://static-car-wine.s3.ap-south-1.amazonaws.com`) + local `public/car_images/` fallback | image pipeline + case‑insensitive static serving |
| **Auth** | Firebase Auth (client, Google provider) + Firebase Admin SDK (token verify) + Passport‑Google OAuth20 session + session cookie user support | `firebase.js`, `auth-helper.js`, `backend/src/config/firebaseAdmin.js`, `middleware/auth.js` |
| **Sessions** | `express-session` (memory store) | cookie: httpOnly, sameSite `lax`, secure in production |
| **External APIs** | Google Gemini (chat), YouTube Data v3 (videos), Google News RSS (news), OpenChargeMap (chargers), Amazon Translate (i18n), Nominatim (geocoding fallback) | see §12 |
| **PDF** | jsPDF (CDN) | generates NOC request letters |
| **Maps** | Leaflet (interactive trip/station maps) + Google Maps JS API (places, `__GOOGLE_MAPS_API_KEY__` placeholder) | |
| **i18n** | custom `TranslationEngine` (client) + `/api/translate` (server → Amazon Translate) | en, hi, kn, ml, te, ta |
| **Hosting/Deploy** | Vercel serverless (`/api/index.js`) + local `node server.js` (port 8081) | see §16 |

---

## 3. Repository Structure

```
EVcarwale/
├── index.html                  # SPA shell: header, mega‑menu, homepage sections, modals, AI widget
├── style.css                   # Global grayscale design tokens, animations, component styles
├── app.js                      # Monolithic frontend logic (routing, data, calculators, renderers)
├── aiService.js                # Gemini prompt + HTTP call (used by Express backend chat endpoint)
├── ai-assistant.js / .css      # Client chat widget (XHR to /api/chat, XSS‑safe markdown renderer)
├── auth-helper.js              # Client auth helpers: logout, `window.WishlistService`
├── firebase.js                 # Browser Firebase config + `auth` / `googleProvider` exports
├── videoIntegration.js         # Featured‑videos grid renderer for index / videos / guides pages
├── server.js                   # Local dev entry: loads root+backend .env, createApp(), port 8081
├── package.json / package-lock.json
├── vercel.json                 # Rewrites `/api/*` and `/auth/*` → `/api/index.js`
├── .gitignore                  # ignores .vercel, .env, backend/.env, node_modules, /car_images, /data
├── robots.txt / sitemap.xml
├── ai_robot_avatar.png, ev_hero.png, nav bar logo.png, tab_logo.png,
│   car_outline.jpg (fallback car silhouette), loading-screen.gif, other hero/illustration images
├── LOGOS/                      # Brand logo images (AUDI, BMW, TATA, …; 35 JPG/PNG)
├── everything_u_need/          # guide‑support images
├── insights/ + insights/images/ # static insight article HTML files
├── public/                     # DEPLOY ROOT: duplicate copies of HTML/JS/CSS + assets
│   ├── car_images/             # brand→model colour‑catalog images (~565 files, 34 brand dirs)
│   ├── data/                   # JSON snapshot copies of data/
│   ├── insights/ + insights_images/ + everything_u_need/ + Learn_Electric_Vehicles/
│   └── LOGOS/
├── backend/
│   └── src/
│       ├── app.js              # createApp factory (CORS, security headers, sessions, passport,
│       │                       # /api router, auth routes, dynamic app.js/index.html env injection)
│       ├── server.js           # dev listener (port 8081)
│       ├── config/             # aws.js, env.js, firebaseAdmin.js
│       ├── middleware/         # auth.js, errorHandler.js, notFound.js, requestLogger.js
│       ├── utils/              # apiError.js, asyncHandler.js, dataState.js
│       ├── models/             # Car, User, Favourite, Review, Blog, … (table specs)
│       ├── repositories/       # eventRepository.js + entity repos (CRUD via DB)
│       ├── controllers/        # request handlers (auth, car, review, …, chat)
│       ├── routes/             # Express routers + Cars.json (snapshot)
│       └── services/           # userService, translateService, blogFetcherService,
│                               # youtubeService, storageService
├── api/
│   ├── index.js                # Vercel serverless entry: createApp()
│   └── tata-vehicles.json      # cached vehicle JSON
├── data/                       # **GITIGNORED** runtime dataset
│   ├── cars.json               # 84‑car catalog (array)
│   ├── variants.json           # brand → model → variant lists
│   ├── ev-features.json        # brand → model → feature categories
│   ├── ev_full_variant_database.json  # superset spec DB (prices may contain mojibake)
│   ├── real_openchargemap_stations.json  # static stations fallback (~26 cities)
│   └── scratch_ev_videos.json  # small offline video backfill
├── insights/                   # static insight HTML
├── project-brain/              # internal working cache (standards, metadata, tasks)
├── scratch/                    # audit/dev scripts (python .py files, not app code)
└── *.md                        # docs: memory.md, database-map.md, architecture.md,
                                # api-map.md, routes.md, dependency-graph.md
```

**Git / deploy nuance:** `data/` is gitignored (`.gitignore` lists `data`, `backend/.env`, `car_images`). Both `data/*.json` and `public/data/*.json` are **untracked**; only `backend/src/routes/Cars.json` is a tracked snapshot. Root `.html/.js/.css` and `public/` copies are double‑maintained and occasionally **differ** (deploy–copy risk).

---

## 4. System Architecture

```text
Browser
   │  (serves HTML from Express/Vercel static; fetch JSON/API from same origin)
   ▼
Express app (createApp)  ── local: node server.js (:8081)  ✔  Vercel: /api/index.js
   ├── static:                     ├── /index.html (env-injected) + /app.js (S3 base injected)
   │   ├── public/ + public/car_images, LOGOS, insights, everything_u_need …
   │   └── root files
   ├── /api/* (apiRoutes)          ├── /auth/* (Passport Google + logout + /api/auth/me)
   ├── seeded third-party proxies  ├── /api/news, /api/videos, /api/chargers, /api/translate
   └── SPA fallback → index.html
        │
        ▼
DynamoDB (users, favourites, recently_viewed, blogs, reviews,
          test_drives, newsletter, chat_history, user_preferences, notifications, payments)
        ▲
S3 (object storage ‑ images/items) ─ via same Express static/serve image middleware or SDK
```

**Frontend talks to backend only when needed**: car catalog is static JSON served by the same Express, while user‑specific or live features (wishlist, recent views, news, videos, blogs, chargers, translate, chat, auth/me) hit `/api/*`.

---

## 5. Routing Intelligence

### A. Frontend (SPA) routing — `app.js`
`handleRouting()` (app.js:12169) — a single router that runs on `DOMContentLoaded`, `load`, `hashchange`, and `popstate`. Route normalization accepts both hash **and** path URLs (e.g. `#/cars/nexon-ev` and `/cars/nexon-ev`), the SPA hides `#homepage-content`, clears `#details-page-content`, renders templates, then re-binds event handlers.

| Route / Hash | Helper renderer | Auth required |
| :--- | :--- | :--- |
| `/` (home) | `restoreHomepage()` | No |
| `/cars/:id`, `/ev/:slug` | `renderCarDetailsPage(car)` | No |
| `/view-all/:section` (popular/launches/upcoming/all) | `renderViewAllPage(section)` | No |
| `/view-all/brands` | `renderViewAllBrandsPage()` | No |
| `/news`, `/news/all` | `loadNews()` + `renderNewsPage()` / `renderPagePage` | No |
| `/news/:id` | `renderNewsArticlePage(article)` | No |
| `/guide/:id` (aliases: charging-at-home→home-charging, apartment-charging→apartment-hub, government-subsidies→subsidies) | `renderGuideArticlePage()` → `renderLearnArticlePage()` → `renderHubArticlePage()` | No |
| `/hub/:key` + calc routes (`/calculators/charging-time`, `/calculators/emi`, `/calculators/savings`) | calculator page renderers | No |
| `/resources/:slug` | `renderResourcePage(slug)` | No |
| `/reviews/expert`, `/reviews/customer` | `renderExpertReviewsPage()` / `renderCustomerReviewsPage()` | No |
| `/brands/:id`, `/brand/:id` | `renderBrandPage(brandId)` | No |
| `/insights`, `/insights/…` | insights renderers | No |
| `/search` | `renderSearchResultsPage()` | No |
| `/learn/:slug` | `renderLearnArticlePage(slug)` | No |
| `/blog/:slug` | `renderBlogArticlePage(article)` | No |
| `/login` | `renderLoginPage()` | No |
| `/about, /contact, /feedback, /faqs, /privacy-policy, /terms…` | `renderStaticPage(pageKey,page)` | No |
| `/compare` | redirect → `compare.html` | No |
| (fragment links `/popular-evs`, `/upcoming`…) | `restoreHomepage()` + scroll | No |
| everything else | `restoreHomepage()` (home) | No |

Aliases: `/trip-planner` → shows home & scroll to `/trip-planner`; `#/chargers` → charging stations page.

### B. Server (Express) routes

| method | path | handler |
| :-- | :-- | :-- |
| `GET` | `/` , `/index.html` | inject Maps key → serve index.html |
| `GET` | `/app.js` | inject S3 base URL → serve app.js |
| `GET` | `/api/*` | `apiRoutes()` |
| `GET` | `/auth/google`, `/auth/google/callback`, `/auth/logout` | Passport OAuth |
| `GET` | `/api/auth/me` | session/profile check |
| `*` | `/api/chargers/*` | charger proxies |
| `*` | `/insights/nothing`, `/insights/…` | alias rewrite |
| `*` | static wildcard + `notFound` + `errorHandler` | fallback |

### C. Vercel serverless

`vercel.json`: rewrites `/api/:path*` and `/auth/:path*` to `/api/index.js` (same Express `createApp`).

---

## 6. Frontend Architecture

### No framework, no build
`app.js` is a single global-scope script hoisting function declarations; everything is available on `window`. HTML templates are built with JavaScript template literals and injected into `#details-page-content` (dynamic overlay container) or `#car-carousel-viewport` on the homepage.

### Key frontend globals & data stores
- `EV_DATABASE = []` — runtime catalog (fetched from static JSON), duplicated+normalized.
- `EV_DATABASE_FULL` (inline field) — a ~6,500‑line compiled variant dataset (`EV_VARIANT_FULL_DB`), replaced by remote JSON via `loadVariantFullDatabase()`.
- `VARIANTS_DATABASE = {}`, `FEATURES_DATABASE = {}`.
- `STATE_DR_TAX_DATABASE` — 28‑state EV tax/registration map.
- `CITY_DISTANCE_DATABASE`, `ROUTE_STATIONS`, `TRIP_CITIES` — route planning metadata.
- `NEWS_DATABASE`, `GUIDE_DATABASE`, `LEARN_DATABASE`, `RESOURCES_DATABASE`, `BLOG_DATABASE`, `INSIGHTS_DATABASE`, `ABOUT_DATABASE`, `STATIONS_DATABASE`.
- `wishlistIds`, `currentDetailsCarId`, `currentUser`, `EVcarwale_auth_user`, `is_logged_in`.

### Initialization chain
`loadDatabase()` (app.js:6926):
1. fetch `/data/cars.json` → fallback S3 static copy
2. strip trailing commas → JSON.parse → dedupe by id
3. rewrite each car’s `image` via `S3_IMAGE_MAPPING[car.id]` or a local `car_images/…` path
4. load `/data/variants.json` → `enrichDatabase()` (attach `car.variants = getVariantsForCar(car)`)
5. load `/data/ev-features.json` → `FEATURES_DATABASE`
6. `initUserSession()`, `renderAllCarousels()`, `populateCompareDropdowns()`, `populateSavingsDropdown()`, `updateCompareTable()`, `initTripPlanner()`.

### Image pipeline
`getS3ImageUrl()` builds an S3 URL; `renderCarImage()` inserts `<img>`; on image error → `handleImageError()` retries local path once, then shows `/car_outline.jpg`. Case-insensitive static serving on server also matches local images (see app.js static regex).

---

## 5. Backend API

### Architecture layers
`controllers` → `services` → `repositories` → DynamoDB.

`asyncHandler` wraps async handlers; `ApiError` carries status; `errorHandler` serializes; `dataState` guards return empty/503 when DynamoDB not configured (graceful degradation). `auth.js` supports **three** identity sources (see §11).

### `/api/*` (see `database-map.md`, `routes.md`)
| Method | Path | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | service status (dynamodb/s3 configured flags) | No |
| POST | `/api/auth/firebase/sync` | upsert Firebase user → DynamoDB | Firebase token |
| GET | `/api/cars`, `/api/cars/ev-models` | serve Cars.json (brand filter supported) | No |
| GET | `/api/blogs`, `/api/blogs/:category/:slug` | blog list / single from RSS+DB fallback | No |
| GET | `/api/reviews`, POST `/api/reviews` | review list/create | optional |
| GET | `/api/favourites`, POST `/api/favourites`, DELETE `/api/favourites/:carId` | wishlist | required |
| GET | `/api/recently-viewed`, POST `/api/recently-viewed` | history | required |
| POST | `/api/test-drives` | create test-drive lead | no |
| POST | `/api/newsletter` | subscribe email | no |
| GET | `/api/chargers/openchargemap` (+ `/nearby`, `/chargezone`, `/`) | OpenChargeMap proxy | no |
| GET | `/api/news`, `/api/news/infrastructure?topic=` | Google News RSS aggregation | no |
| GET | `/api/videos`, `/api/videos/infrastructure` | YouTube search w/ whitelist+fallback | no |
| GET | `/api/car-images/list?brand=&model=` | installed color catalogue listing | no |
| POST | `/api/translate` | Amazon Translate batch | no |
| POST | `/api/chat` | Gemini chat (azure path via `aiService.js`) | no |
| (any) | `/api/payments` `/api/notifications` `/api/admin` | placeholder 501 responses | – |

---

## 4. Database

### DynamoDB tables (from `models/*`)
Multi-attribute single-table design with `pk`/`sk`:

| Table (entity) | PK | SK | Fields |
| :--- | :--- | :--- |
| `users` | `PROFILE` | `USER#<firebaseUid>` `…` | firebaseUid, name, email, phone, avatar, provider, role, lastLoginAt |
| `cars` | `CAR#<id>` | `PROFILE` | id, name, brand, priceVal, price, rangeVal, range, battery, charging, sections, image |
| `brands` | `CAR#<…>` / brand spec | `…` | (brand→model relation) |
| `favourites` | `USER#<uid>` | `FAVOURITE#<carId>` | firebaseUid, carId |
| `recently_viewed` | `USER#<uid>` | `RECENT#<carId>` | firebaseUid, carId, viewedAt |
| `blogs` | `BLOG#<category>#<slug>` | `ARTICLE` | slug, category, categoryName, title, summary, htmlContent, featuredImage, status, publishedAt |
| `reviews` | `REVIEW#<id>` | `DETAILS` | id, carId, firebaseUid, type, author, rating, title, content, pros, cons, status |
| `test_drives` | `TEST_DRIVE#<id>` | `BOOKING` | id, carId, carName, name, phone, email, preferredDate, city, status |
| `newsletter` | `NEWSLETTER#<email>` | `SUBSCRIPTION` | email, source, status |
| `chat_history` | `CHAT#<uid\|anony>` | `TURN#<createdAt>#<id>` | id, firebaseUid, messages, reply, provider |
| `user_preferences` | `USER#<uid>` | `PREFERENCES` | language, notificationSettings, savedFilters, metadata |
| `notifications` | `USER#<uid>` | `NOTIFICATION#<createdAt>#<id>` | channel, title, message, status, metadata |
| `payments` | `USER#<uid>` | `PAYMENT#<id>` | provider, amount, currency, purpose, externalPaymentId, status |

Data access: `dynamoRepository.js` provides `put/get/query/scan/update/delete` and normalizes AWS transient errors → `503 ApiError`. When AWS not configured, repos return `[]` / `dataUnavailableResponse` (the frontend degrades to local static data).

---

## 5A. Data Flow for core flows

### Car catalog → homepage
`/data/cars.json` → `loadDatabase()` → normalized list → `enrichDatabase()` → carousels.

### Search & budget/brand filter
hero/browse filters → in‑memory `filterCars()` → carousel re-render.

### Car detail page
hash `#/cars/id` → lookup car → load impacts (S3 mapping) → color gallery via `/api/car-images/list` → render specs/variants → related cars.

### Trip planner
Inputs (vehicle, cities, AC, style) → `calcTripData()` (pure client) → `renderTripResults()` → Leaflet map + stat cards. Uses `/data` metadata for ranges/route distances.

### Login flow
1. Google button → `firebase.auth.signInWithGoogle` (client) OR Passport `/auth/google` (server).
2. Server issues session cookie or returns user.
3. Client `initUserSession()` calls `/api/auth/me` to detect logged‑in user.
4. Favorites use `WishlistService` (localStorage keyed by email) + `/api/favourites`.

### Newsletter / test‑drive
Static forms → POST `/api/newsletter` / `/api/test-drives` (working; note feedback form on `feedback.html` is cosmetic).

---

## 6B. API Inventory (used-by answer)

| Feature | Frontend Files | Backend Files | DB table | External svc |
| :--- | :--- | :--- | :--- | :--- |
| Catalog / calendar | app.js (`loadDatabase`, carousels, detail page) | `carRoutes.js`, `carController.js`, `Cars.json` | `cars` | – (S3 images) |
| Compare | app.js `populateCompareDropdowns`/`updateCompareTable` | `carRoutes.js` | – | – |
| Search | app.js | | | |
| Trip planner | app.js (`initTripPlanner`, `calcTripData`) | – | – | Leaflet/OSM |
| Charging time / EMI / savings | app.js (pure math) | – | – | – |
| Charging station | app.js stations + `charging-stations.html` | `chargerRoutes.js` | – | OpenChargeMap + static dataset |
| News | app.js news loaders | `newsRoutes.js` | – | Google News RSS |
| Videos | `videoIntegration.js`, `videos.html` | `videoRoutes.js` | – | YouTube API |
| Blogs | app.js blogs pages | `blogRoutes.js` + `blogFetcherService` | blogs | RSS |
| User session | `auth-helper.js`, `firebase.js`, app | `authController.js`, `middleware/auth.js` | users | Firebase |
| Wishlist | `WishlistService` | `favouriteController.js`, `favouriteRepository.js` | favourites | – |
| Recently viewed | app.js | `recentlyViewedController.js` | recently_viewed | – |
| Reviews | app.js reviews | `reviewController.js`, `reviewRepository.js` | reviews | – |
| Test drive | `index.html` modal | `leadController.js`, `leadRepository.js` | test_drives | – |
| Newsletter | `index.html` footer | `leadController.js`, `leadRepository.js` | newsletter | – |
| Translation | `app.js` TranslationEngine | `translateRoutes.js`, `translateService.js` | – | Amazon Translate |
| NOC letter | app.js (`renderNocPage`) jsPDF | – | – | – |
| Videos | `videoIntegration.js` | `videoRoutes.js` + `youtubeService.js` | – | YouTube API | 

---

## 7. Calculator Math Engines (`app.js`)

| Engine | fn | formula / notes |
| :--- | :--- | :--- |
| **On‑Road Price** | `getOnRoadPriceData` (app.js:7142) | `price + road_tax% + reg_fee + insurance(2.5%?) + handling(₹2000) − ev_benefit` per state (28‑state table) |
| **Trip Planner** | `calcTripData` (app.js:7473) | Real range = claimed range × ACcoeF × styleCoeF × pax × traffic; charging stops to 85% SoC; DC charge time; cost @ ₹20/kWh vs petrol @ ₹105/L & 15 km/L |
| **Trip renderer** | `renderTripResults` / `renderTripMapRoute` (17079 / 17190) | stat cards + Leaflet polyline + station markers |
| **Trip map** | `renderTripMapRoute` | uses `ROUTE_STATIONS` / route data |
| **EMI** | `updateEMICalculator`, `bindEmiCalculatorLogic`, `updateDetailEMI` | `EMI = P·r·(1+r)^n / ((1+r)^n−1)` |
| **Petrol savings** | `updateLandingSavings`, `bindPetrolSavingsCalculatorLogic` | EV efficiency = battery(kWh)/installedRange(km); monthly/annual savings vs petrol |
| **Charging time** | `bindChargingTimeCalculatorLogic` | needed = cap×(end−start)/100 ; effPower = power×0.9 ; battery-bar/donut |
| **Highway readiness** | `getHighwayReadiness*` (16991/17032) | corridor-aware readiness score |

---

## 8. Environment & Configuration

`.env` (root, gitignored) seeds `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`. `backend/.env` holds AWS/API keys (gitignored). `config/env.js` reads the full set with defaults.

| Variable | Purpose |
| :--- | :--- |
| `NODE_ENV`, `PORT`, `CORS_ORIGIN` | env / server / CORS |
| `AWS_*` (region, keys, profile, role, session token, table names per entity, S3 bucket, S3 public base, DynamoDB table prefix) | AWS DynamoDB + S3 + Translate |
| `FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY / SERVICE_ACCOUNT_JSON` | admin credential to verify tokens |
| `GOOGLE_CLIENT_ID / SECRET / CALLBACK_URL` | Passport Google OAuth |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | AI chat |
| `GOOGLE_MAPS_API_KEY` | injected into index.html (`__GOOGLE_MAPS_API_KEY__`) |
| `YOUTUBE_API_KEY` | videos |
| `CURRENT_NEWS_API_KEY` | news |
| `OPENCHARGEMAP_API_KEY` | charger proxy (tokenRidge in code fallback) |
| `SESSION_SECRET` | express‑session |

> Secrets are injected at request time into `app.js`/`index.html` server‑side. Details in §16.

---

## 9. Environment & Deployment Workflow

### Local
```bash
npm install
npm run dev        # root server.js  (port 8081)
# or # npm run backend (backend/src/server.js)
```
`server.js`: loads root `.env`, then `backend/.env` (overrides), clears empty keys, `createApp()`, `app.listen(8081)`, calls `initializeDataServices()`.

### Vercel
`vercel.json` rewrites `/api/:path*` & `/auth/:path*` → `api/index.js`. Express serves static `/public` and injects env into HTML/JS. Root `server.js` is the full-feature option; Vercel uses the same factory. Containers bundle `includeFiles` for `public/` static assets.

---

## 10. Dependency graph (critical files)

```
index.html  ← style.css, ai-assistant.css, app.js, aiService.js, ai-assistant.js,
              auth-helper.js, videoIntegration.js, firebase.js

app.js  ←  data/*.json (cars, variants, ev-features), /api/…, static images
server.js  →  backend/src/app.js  →  routes/*  →  controllers  →  services  →  repositories → AWS SDK
api/index.js  → (same) createApp()
```

**Critical / high‑impact files (modify with care):**
- `app.js` — monolith: home + carousels + detail + all calculators + all renderers + translation engine.
- `backend/src/app.js` — static/env injection, OAuth, `/api` wiring.
- `index.html` — SPA map/layout shell.
- `data/cars.json` + `public/data/cars.json` (runtime catalog; not tracked).
- `backend/src/routes/Cars.json` — tracked snapshot used by `/api/cars`.

---

## 11. Authentication & Authorization

Two parallel systems:

1. **Google OAuth (Passport, session)**
   - `/auth/google` → consent → `/auth/google/callback` → session cookie; `returnTo` respected (safe redirect validation).
   - `/auth/logout` destroys session.
2. **Firebase identity**
   - Client Google sign‑in via `firebase.js` (web SDK).
   - `middleware/auth.js` `optionalAuth()`:
     1. session user (email/password session) → uses `req.session.user`
     2. Passport user → `req.user`
     3. `Bearer` token → Firebase Admin `verifyIdToken`
   - `requireAuth()` = optionalAuth + `if (!req.firebaseUser) 401`.

- **Wishlist identity** doubles: uses localStorage key per email, falls back to anonymous key; logs in users sync to `/api/favourites`.
- **Session cookies** encrypted with `SESSION_SECRET`; httpOnly; secure in prod; sameSite `lax`.
- **No role‑based enforcement** in routes (only presence/absence of authenticated user).

---

## 15. Feature Inventory (name → entry point → files)

| Feature | Entry (front) | Files | Backend | DB |
| :--- | :--- | :--- | :--- | :--- |
| Hero search | `index.html` | app.js search handlers | – | – |
| Browse by brand/budget | `index.html` `/browse` | app.js (`brand-chip`, `budget-chip`) | – | – |
| Carousels (popular/upcoming/launch) | app.js carousels | | – | |
| Car detail page | `#/cars/:id` | app.js `renderCarDetailsPage` | read images | |
| Trip planner | `/trip-planner` | `initTripPlanner`, calc | – | – |
| EMI / savings / charging time | `hub/*` etc | app.js calc fns | – | – |
| Charging stations | `charging-stations.html` | app.js | `/api/chargers` | – |
| AI chat | `ai-assistant.js` | `aiService.js` | `/api/chat` | chat_history (opt) |
| Test drive | modal | form | `/api/test-drives` | test_drives |
| Newsletter | footer | form | `/api/newsletter` | newsletter |
| Wishlist | heart icons | `WishlistService` | `/api/favourites` | favourites |
| Recently viewed | car | app.js | `/api/recently-viewed` | recently_viewed |
| News | home/news pages | app.js | `/api/news` | – |
| Videos | home / videos page | `videoIntegration.js` | `/api/videos` | – |
| Blogs | home/insights | app.js | `/api/blogs` + DB | blogs |
| Translation | language menu | `TranslationEngine` | `/api/translate` | Amazon Translate |
| NOC letter | detail page | `jsPDF` | – | – |

---

## 16. Performance & Technical Debt

**Performance:**
- `app.js` (~1 MB, 19.6k lines) monolithic, slows parsing.
- In‑memory filtering scans; DynamoDB `.scan()` lookups (no GSI) as tables grow.
- No service‑worker / offline caching; each route change re-renders dynamically.
- Third‑party latency: news & videos proxy wait synchronously (10s worst‑case) unless cache hit.
- Large static bundles for each standalone page.

**Technical debt:**
- Frontend/backend disconnect: many forms don’t POST (`feedback.html` cosmetic only); test‑drive/newsletter DO post at least.
- No automated test suite for calculators or DB queries (only `light‑my‑request` dev‑dep present but rarely used).
- Dynamic deploy copies duplicated (root vs `public/`) → drift risk.
- Data mojibake in JSON texts (₹, “Citroën”) and console‑level image‑path inconsistencies (e.g. `MARUTI_SUZUKI/jimny.png`, `car_images/MINI?` folder with `?`, `ROLLS_ROYCLE.JPG` vs `ROLLS_ROYCE`).
- `feedback.html` success‑only form (no backend wiring).
- `__GOOGLE_MAPS_API_KEY__` placeholder un‑replaced in some standalone pages.
- `LOGOS/EvCarWale_Logo.jpeg` missing (OG image 404 across pages).

---

## 17. Current Known Issues / Fix Notes (as of last update)

- vetted frontend fixes were committed successfully (e.g. `4717268` "Trip planner: de‑clutter …, add themed popup").
- **Working tree not clean at last audit:** there are unstaged changes across many files not yet committed (backend auth hardening, app.js route simplifications, Citroen image/logo swap, go‑to‑top/fixed nav changes, deleted `signup.html`/`forgot-password.html`). Verify and commit deliberately; keep `backend/.env` and `data/` ignored.
- Backend runs on `localhost:8081` (single Express process serving both frontend + API). `npm run dev`.

---

## 8. Final Rules of Engagement

1. Prefer `memory.md` as the source of truth; update it after any architecture/route/schema change.
2. Never commit `.env` or `data/` (gitignored) — use `.env.example` for documentation.
3. When modifying `app.js` (monolith) run `node --check app.js` first; keep template literals balanced.
4. Static files exist in the root AND `public/` — keep them in sync or the deploy will go stale (server prefers `/public` then root).
5. Do not expose AWS keys in frontend or in memory.md; only purpose is documented.

---

_End of EV Car Wale project memory. Updated during repository analysis on 2026‑08‑08._