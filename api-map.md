# EVcarwale API & Function Map

This document outlines the interfaces and parameters for both backend Express endpoints and client-side calculations inside `app.js`.

---

## 1. Backend REST API Map (`/api/*`)

### A. Authentication & User Sync
#### `POST /api/auth/firebase/sync`
- **Authentication**: Required (Firebase Bearer token)
- **Input Header**: `Authorization: Bearer <JWT_Token>`
- **Input Body**: Optional profile keys: `{ email, name, phone, avatar }`
- **Output Success (200)**:
  ```json
  {
    "success": true,
    "data": {
      "firebaseUid": "UID_STRING",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+919999999999",
      "avatar": "https://avatar-url",
      "provider": "firebase",
      "lastLoginAt": "ISO_TIMESTAMP"
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Missing token or token validation failure.
  - `503 Service Unavailable`: Firebase Admin SDK is not configured on the server.

---

### B. Catalog & Media Operations
#### `GET /api/cars/ev-models`
- **Query Params**: `brand` (string, optional)
- **Output Success (200)**: Array of vehicle specifications from `Cars.json` (filtered by brand if provided).
- **Error (500)**: Failed to parse/read JSON file.

#### `GET /api/car-images/list`
- **Query Params**: `brand` (string, required), `model` (string, required)
- **Output Success (200)**: List of model color files and paths:
  ```json
  {
    "colors": [
      { "filename": "red.jpg", "name": "Red", "path": "car_images/TATA/tata_punch/red.jpg" }
    ]
  }
  ```

---

### C. Favourites & History
#### `GET /api/favourites`
- **Authentication**: Required
- **Output (200)**: `{ "success": true, "count": 1, "data": ["nexon-ev"] }`

#### `POST /api/favourites`
- **Authentication**: Required
- **Input Body**: `{ "carId": "car-id" }`
- **Output (201)**: `{ "success": true, "data": { "carId": "car-id" } }`

#### `DELETE /api/favourites/:carId`
- **Authentication**: Required
- **Output (200)**: `{ "success": true }`

#### `GET /api/recently-viewed`
- **Authentication**: Required
- **Output (200)**: `{ "success": true, "count": 1, "data": ["punch-ev"] }`

#### `POST /api/recently-viewed`
- **Authentication**: Required
- **Input Body**: `{ "carId": "car-id" }`
- **Output (201)**: `{ "success": true, "data": { "carId": "car-id" } }`

---

### D. Reviews & Leads
#### `GET /api/reviews`
- **Query Params**: `carId` (string, optional), `type` (string, optional - e.g. `'customer'`, `'expert'`)
- **Output (200)**: `{ "success": true, "count": N, "data": [...] }`

#### `POST /api/reviews`
- **Authentication**: Optional (JWT ID token verified to extract author details)
- **Input Body**: `{ "carId": "id", "rating": 5, "title": "Good", "content": "Review content", "pros": ["Pro"], "cons": ["Con"] }`
- **Output (201)**: Synced review entry.

#### `POST /api/test-drives`
- **Input Body**: `{ "carId": "id", "carName": "name", "name": "User", "phone": "123", "email": "email", "preferredDate": "date", "city": "city" }`
- **Output (201)**: `{ "success": true, "data": { ... } }`

#### `POST /api/newsletter`
- **Input Body**: `{ "email": "email@test.com", "source": "footer" }`
- **Output (201)**: `{ "success": true, "data": { ... } }`

---

### E. Third-Party proxies
#### `GET /api/chargers/nearby`
- **Query Params**: `latitude` (string), `longitude` (string), `distance` (string - in KM), `maxresults` (string)
- **Output**: Proxied JSON output from OpenChargeMap API.

#### `GET /api/news`
- **Output**: Array of EV news articles from CurrentsAPI matching query terms (relevance $\ge 80\%$, cached for 30 minutes).

#### `GET /api/videos`
- **Output**: Array of YouTube passenger EV reviews in India from whitelisted channels (cached for 1 hour).

#### `POST /api/chat`
- **Input Body**: `{ "messages": [{ "role": "user", "content": "Tell me about Curvv EV" }] }`
- **Output (200)**: `{ "reply": "Response string from Gemini..." }`

---

## 2. Client-Side Functions & Calculations (`app.js`)

### A. Mathematical Calculation Engines
#### `getOnRoadPriceData(exShowroomLakh, stateKey)`
- **Input**: Ex-showroom cost (in Lakhs), state key matching `STATE_TAX_DATABASE` (e.g. `'delhi'`).
- **Formulas**:
  - $\text{Road Tax} = \text{Ex-Showroom} \times \text{state.roadTaxPct}$
  - $\text{Insurance} = \text{Ex-Showroom} \times 0.025$
  - $\text{EV Benefit} = \text{state.evIncentiveFlat} + (\text{Ex-Showroom} \times \text{state.evIncentivePct})$
  - $\text{On-Road} = \text{Ex-Showroom} + \text{Road Tax} + \text{Reg. Charge} + \text{Insurance} + \text{Handling} - \text{EV Benefit}$

#### `calcTripData(carId, fromKey, toKey, days, passengers, acUsage, drivingStyle)`
- **Input**: Car ID, source/destination keys matching `CITY_DISTANCE_DATABASE`, usage parameters.
- **Formulas**:
  - $\text{AC factor} = \{ \text{off: 1.00}, \text{low: 0.97}, \text{medium: 0.93}, \text{high: 0.88} \}$
  - $\text{Style factor} = \{ \text{eco: 1.05}, \text{normal: 1.00}, \text{sport: 0.88} \}$
  - $\text{Passenger factor} = \{ \text{1-2: 1.00}, \text{3: 0.99}, \text{4: 0.97}, \text{5: 0.95} \}$
  - $\text{Real Range} = \text{Claimed Range} \times \text{AC factor} \times \text{Style factor} \times \text{Passenger factor}$
  - $\text{Stops} = \text{Math.max}\left(0, \text{Math.ceil}\left(\frac{\text{Distance}}{\text{Real Range} \times 0.85}\right) - 1\right)$
  - $\text{Electricity Cost} = \left(\frac{\text{Distance}}{\text{Claimed Range} / \text{Battery KWh}}\right) \times \text{electricityTariff}$

#### `updateEMICalculator()`
- **Logic**: Reads sliders and updates monthly installment payouts:
  - $\text{Loan Amount} = \text{Price} - \text{Down Payment}$
  - $R = \frac{\text{Annual Rate}}{12 \times 100}$
  - $N = \text{Tenure Years} \times 12$
  - $\text{EMI} = \text{Loan Amount} \times R \times \frac{(1+R)^N}{(1+R)^N - 1}$

#### `updateLandingSavings()`
- **Logic**: Compares daily ICE running costs (assumed mileage **15 km/l**) against selected EV:
  - $\text{Monthly Distance} = \text{Daily Distance} \times 30$
  - $\text{Monthly Petrol Cost} = \frac{\text{Monthly Distance}}{15} \times \text{Petrol Price}$
  - $\text{Monthly EV Cost} = \text{Monthly Distance} \times \left(\frac{\text{Battery KWh}}{\text{Range Km}}\right) \times \text{Electricity Tariff}$
  - $\text{Total Savings} = (\text{Monthly Petrol Cost} - \text{Monthly EV Cost}) \times 12 \times \text{Period Years}$

---

### B. Utilities & Page Renderers
- **`downloadRWAPdf(carName)`**: Imports `jsPDF` dynamically to generate and download a pre-populated Resident Welfare Association charging permit request letter.
- **`applyJargonBuster()`**: Walks the visible text nodes in the DOM, wrapping abbreviations listed in `JARGON_DICTIONARY` inside hoverable span elements.
- **`renderCarDetailsPage(car)`**: Injects markup representing a vehicle's specifications, charging curves, variants, and reviews.
- **`renderBrandsPage()`**: Displays supported brands directory. Displays filtered match layouts in catalog view.
