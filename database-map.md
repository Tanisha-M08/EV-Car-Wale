# EVcarwale Database Map & Data Schemas

The EVcarwale data architecture comprises **Amazon DynamoDB** for cloud persistence, the browser's **LocalStorage** for user preferences/wishlists, and **in-memory static databases** in `app.js` and `blogsDatabase.js` for catalog data and guide content.

---

## 1. Amazon DynamoDB Single-Table Map

All cloud entities are persisted within DynamoDB. They share generic partition keys (`pk`) and sort keys (`sk`) to support flexible indexing structures.

### A. Users (`users`)
- **Purpose**: Stores profile attributes synced from Google Auth (Firebase).
- **Primary Key**: `pk = USER#<firebaseUid>`, `sk = PROFILE`
- **Fields**:
  - `firebaseUid` (String, Partition Key component)
  - `name` (String, Display Name)
  - `email` (String)
  - `phone` (String)
  - `avatar` (String, Photo URL)
  - `provider` (String, default `'firebase'`)
  - `role` (String, default `'user'`)
  - `lastLoginAt` (ISO Timestamp)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### B. Favourites (`favourites`)
- **Purpose**: Mapped wishlist items linked to user IDs.
- **Primary Key**: `pk = USER#<firebaseUid>`, `sk = FAVOURITE#<carId>`
- **Fields**:
  - `firebaseUid` (String)
  - `carId` (String)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### C. Recently Viewed (`recently_viewed`)
- **Purpose**: Logs user's recently visited vehicle profiles (up to 12 items).
- **Primary Key**: `pk = USER#<firebaseUid>`, `sk = RECENT#<carId>`
- **Fields**:
  - `firebaseUid` (String)
  - `carId` (String)
  - `viewedAt` (ISO Timestamp)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### D. Reviews (`reviews`)
- **Purpose**: Customer feedback and ratings.
- **Primary Key**: `pk = REVIEW#<id>`, `sk = DETAILS`
- **Fields**:
  - `id` (String, UUID)
  - `carId` (String, e.g. `'nexon-ev'`)
  - `firebaseUid` (String, optional)
  - `type` (String, default `'customer'`)
  - `author` (String, author display name)
  - `rating` (Number, 1 to 5)
  - `title` (String)
  - `content` (String)
  - `pros` (Array of Strings)
  - `cons` (Array of Strings)
  - `status` (String, e.g. `'approved'`, `'pending'`)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### E. Test Drives (`test_drives`)
- **Purpose**: Lead bookings for partner dealerships.
- **Primary Key**: `pk = TEST_DRIVE#<id>`, `sk = BOOKING`
- **Fields**:
  - `id` (String, UUID)
  - `carId` (String)
  - `carName` (String)
  - `name` (String, lead name)
  - `phone` (String, contact phone)
  - `email` (String)
  - `preferredDate` (String)
  - `city` (String)
  - `status` (String, default `'new'`)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### F. Newsletter (`newsletter`)
- **Purpose**: Newsletter subscription list.
- **Primary Key**: `pk = NEWSLETTER#<email>`, `sk = SUBSCRIPTION`
- **Fields**:
  - `email` (String)
  - `source` (String, default `'footer'`)
  - `status` (String, default `'subscribed'`)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

### G. Chat History (`chat_history`)
- **Purpose**: Persists chatbot conversation turns.
- **Primary Key**: `pk = CHAT#<firebaseUid|anonymous>`, `sk = TURN#<createdAt>#<id>`
- **Fields**:
  - `id` (String, UUID)
  - `firebaseUid` (String, default `'anonymous'`)
  - `messages` (Array of objects representing conversation turns)
  - `reply` (String, Gemini answer)
  - `provider` (String, default `'gemini'`)
  - `createdAt` (ISO Timestamp)
  - `updatedAt` (ISO Timestamp)

---

## 2. In-Memory Static Databases (`app.js` & `blogsDatabase.js`)

### A. EV Fleet Database (`EV_DATABASE`)
- **Attributes**: `id` (unique), `name`, `brand`, `priceVal` (Lakhs), `price`, `rangeVal`, `range`, `battery`, `charging` (DC speed), `speed`, `power`, `safety`, `features`, `dimensions`, `image`, `sections` (Array, e.g., `['popular']`).
- **Variants Auto-Generation**: Triggered on page loads by `enrichDatabase()`. Creates three price variants per model:
  - *Executive Core*: $90\%$ price, $80\%$ range, $85\%$ battery capacity.
  - *Empowered Luxury*: $100\%$ price, $100\%$ range, $100\%$ battery.
  - *Performance Flagship*: $115\%$ price, $110\%$ range, $120\%$ battery, AWD drivetrain.

### B. State Policy Database (`STATE_TAX_DATABASE`)
- **Attributes**: `label`, `roadTaxPct`, `regCharge`, `evIncentivePct`, `evIncentiveFlat`, `evBenefitNote`. Maps 12 states (e.g., Delhi, Maharashtra, Gujarat, Tamil Nadu) to compute local EV on-road prices.

### C. News & Guide Chapters (`NEWS_DATABASE`, `GUIDE_DATABASE`)
- **`NEWS_DATABASE`**: Local fallback EV news cards.
- **`GUIDE_DATABASE`**: Mapped buying guides containing inline SVGs and glossary references.
- **`JARGON_DICTIONARY`**: Dictionary values mapping abbreviations (e.g. CCS2, ADAS, kWh) to tooltips.

---

## 3. Browser Storage & Local Persistence

### A. LocalStorage (`recently_viewed_evs`)
- **Format**: JSON serialized array of strings containing vehicle IDs.
- **Limit**: Max 6 unique items.
- **Data flow**: Appended when a user triggers `renderCarDetailsPage()`.
- **Purpose**: Displays a filtered "Recently Viewed" collection in the landing page carrousel when selected in navigation.

### B. Local Session Array (`wishlistIds`)
- **Format**: In-memory JavaScript array.
- **Mutated by**: `toggleWishlist(carId)` (adds or deletes ID elements).
- **Scope**: Session-only. **WARNING**: Wishlisted items are lost upon browser tab reload (not persisted to `localStorage` despite pre-existing system notes).
- **UI Element**: `#wishlist-badge` displaying the item count.

---

## 4. Entity Relationships

```text
  Users (1) ────[ pk: USER#<uid>, sk: PROFILE ]
    │
    ├───── Favourites (N) ─────────── [ sk: FAVOURITE#<carId> ]
    │
    ├───── Recently Viewed (N) ────── [ sk: RECENT#<carId> ]
    │
    ├───── User Preferences (1) ───── [ sk: PREFERENCES ]
    │
    └───── Payments (N) ───────────── [ sk: PAYMENT#<id> ]

  Cars (1) ─────[ pk: CAR#<id>, sk: PROFILE ]
    │
    └───── Reviews (N) ────────────── [ pk: REVIEW#<id>, sk: DETAILS, carId: <carId> ]
```
- Note: Favourites and Recently Viewed map user profiles directly to vehicle IDs (`carId`). Reviews reference `carId` inside their attribute values to allow in-memory filtering.
