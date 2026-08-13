# EVcarwale Routing Map

Routing in EVcarwale is split into two primary layers: **client-side hash routing** for Single Page Application navigation, and **server-side REST routing** for backend API endpoints.

---

## 1. Client-Side SPA Routing

All frontend navigation is handled via hash routes in the browser. The SPA router intercepts address updates, determines the active viewport, and dynamically compiles and injects layout markup into the page wrappers.

### SPA Resolution Mechanics
1. **Triggers**:
   - `window.addEventListener('hashchange', handleRouting);`
   - `window.addEventListener('DOMContentLoaded', handleRouting);`
2. **State Updates**:
   - Updates page container visibility: hides landing container `#homepage-content` and reveals `#details-page-content` (or vice-versa).
   - Resets scroll position: `window.scrollTo(0, 0)`.
   - Sets navigation bar visual states.

### SPA Routes Table

| Route Hash | Controller Function | Purpose / View | Auth Required | Local State Mutations |
| :--- | :--- | :--- | :--- | :--- |
| `#/` *(or empty)* | `restoreHomepage()` | Renders main landing dashboard, calculators, brand icons, and news grid. | No | Restores home sliders & search inputs. |
| `#/cars/:id` | `renderCarDetailsPage(car)` | Opens specifications, active variant trims, savings calculators, and society PDF generators for a car. | No | Appends `car.id` to `localStorage` key `recently_viewed_evs` (max 6 items). |
| `#/view-all/:section` | `renderViewAllPage(section)` | Displays filtered grids of EVs (section values: `popular`, `launches`, `upcoming`). | No | None. |
| `#/news/all` | `renderAllNewsPage()` | Lists all industry updates from `NEWS_DATABASE`. | No | None. |
| `#/news/:id` | `renderNewsArticlePage(article)`| Opens the full read view of a selected news article. | No | None. |
| `#/guide/:id` | `renderGuideArticlePage(chapter)`| Renders a specific buying guide chapter with inline SVG schematics. | No | None. |
| `#/hub/:key` | `renderHubArticlePage(key)` | Renders detailed FAQ sheets for topics (e.g., `regen-braking`, `battery-health`). | No | None. |
| `#/reviews/expert` | `renderExpertReviewsPage()` | Displays professional vehicle assessments, pros/cons list tables, and NCAP ratings. | No | None. |
| `#/reviews/customer` | `renderCustomerReviewsPage()` | Displays owner feedback cards, owner satisfaction scores, and mileage logs. | No | None. |
| `#/brands` | `renderBrandsPage()` | Shows a grid of all available automotive brand badges. | No | None. |
| `#/brand/:brandId` | `renderBrandPage(brandId)` | Opens a filtered subpage showing only vehicles belonging to the specified brand. | No | None. |

---

## 2. Server-Side REST Routing

All server-side requests are mounted behind `/api`. Dynamic REST endpoints are processed by the Express application inside `backend/src/routes`.

### REST Route Table

| Method | Route | Controller Handler | Purpose | Auth Required | DB Model / Table |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | `health` | Status check for API services, AWS configuration, and S3 status. | No | None |
| **POST**| `/api/auth/firebase/sync` | `syncFirebaseUser` | Syncs Firebase Google-login metadata to database. | **Yes** (Firebase JWT) | `users` |
| **GET** | `/api/cars/ev-models` | *Inline Route Handler* | Fetches model listings from static JSON. | No | None (`Cars.json`) |
| **GET** | `/api/car-images/list` | *Inline Route Handler* | Scans public folder to list files matching brand/model. | No | None (Filesystem) |
| **GET** | `/api/blogs` | `listBlogs` | Lists published blog articles (supports query category/search). | No | `blogs` |
| **GET** | `/api/blogs/:category/:slug`| `getBlogBySlug` | Fetches a single blog article matching category and slug. | No | `blogs` |
| **GET** | `/api/reviews` | `listReviews` | Lists approved reviews (supports query filtering by `carId`/`type`). | No | `reviews` |
| **POST**| `/api/reviews` | `createReview` | Submits a customer review for validation. | **Optional** (Firebase JWT) | `reviews` |
| **GET** | `/api/favourites` | `listFavourites` | Lists car IDs saved by the user. | **Yes** (Firebase JWT) | `favourites` |
| **POST**| `/api/favourites` | `addFavourite` | Appends a car ID to the user's favourites list. | **Yes** (Firebase JWT) | `favourites` |
| **DELETE**| `/api/favourites/:carId` | `removeFavourite` | Removes a car ID from the user's favourites list. | **Yes** (Firebase JWT) | `favourites` |
| **GET** | `/api/recently-viewed` | `listRecentlyViewed` | Lists user's recently viewed car IDs (up to 12 items). | **Yes** (Firebase JWT) | `recently_viewed` |
| **POST**| `/api/recently-viewed` | `addRecentlyViewed` | Logs a car ID as recently viewed by the user. | **Yes** (Firebase JWT) | `recently_viewed` |
| **POST**| `/api/test-drives` | `createTestDriveRequest`| Submits a customer test drive booking lead. | No | `test_drives` |
| **POST**| `/api/newsletter` | `subscribeNewsletter` | Adds user email to newsletter list. | No | `newsletter` |
| **GET** | `/api/chargers/nearby` | *Inline Route Handler* | Proxies nearby EV charging stations to Open Charge Map. | No | None |
| **GET** | `/api/news` | *Inline Route Handler* | Fetches Indian EV news using CurrentsAPI search query. | No | News cache |
| **GET** | `/api/videos` | *Inline Route Handler* | Fetches passenger EV videos using YouTube v3 API. | No | Video cache |
| **POST**| `/api/chat` | *Inline Controller* | Chatbot interface utilizing Google Gemini. | No | `chat_history` |
| **GET/POST**| `/api/payments` | `placeholder` | Placeholder for payment operations. | No | `payments` (mocked) |
| **GET/POST**| `/api/notifications` | `placeholder` | Placeholder for user notifications. | No | `notifications` (mocked) |
| **GET/POST**| `/api/admin` | `placeholder` | Placeholder for administrative operations. | No | Mocked dashboard |

---

## 3. Fallback and Route Recovery

### Client-Side Fallback
If the hash route parameter fails to match any valid identifier in the database (e.g. `#/cars/invalid-model` or `#/guide/invalid-chapter`), the router fails gracefully. It resets path states and calls:
```javascript
restoreHomepage();
```
This hides subpage views and renders the landing page catalog.

### Server-Side Wildcard Fallback
All non-`/api` requests (such as `/cars/nexon` or static page routes) are intercepted by the Express catch-all router inside `backend/src/app.js`:
```javascript
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});
```
This serves `index.html` to the browser, allowing the client-side SPA router to evaluate and display the correct view.
Unmatched REST API requests (e.g., `/api/invalid-route`) trigger the `notFound.js` middleware, returning a structured JSON error:
```json
{
  "success": false,
  "error": "Not Found"
}
```
