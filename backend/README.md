# EV CAR WALE Backend

Node.js + Express backend for the existing EV CAR WALE frontend.

The current frontend UI remains unchanged. The backend is mounted behind `/api` and the root server still serves the existing static SPA.

## Stack

- Node.js
- Express.js
- Amazon DynamoDB through AWS SDK v3
- Amazon S3 through AWS SDK v3 for files, images, and documents
- Firebase Admin SDK for Google-login token verification

## Folder Structure

```text
backend/
  src/
    app.js
    server.js
    config/
    controllers/
    middleware/
    models/
    repositories/
    routes/
    services/
    utils/
```

## Setup

1. Copy `backend/.env.example` to `backend/.env` or set the same variables in the root `.env`.
2. Add AWS region and credentials, or run the app in AWS with an IAM role and `AWS_USE_IAM_ROLE=true`.
3. Create DynamoDB tables for the entities below, or use `AWS_DYNAMODB_TABLE_PREFIX` to derive names.
4. Add an S3 bucket for images and documents.
5. Add Firebase Admin credentials using either `FIREBASE_SERVICE_ACCOUNT_JSON` or the individual Firebase fields.
6. Start the app from the project root:

```bash
npm start
```

## DynamoDB Entities

- users
- cars
- brands
- favourites
- recently viewed
- blogs
- reviews
- test drive bookings
- newsletter subscribers
- AI chat history
- user preferences

The repository layer uses simple `pk` and `sk` primary keys so the implementation can support either separate per-entity tables or prefixed names through environment variables.

## S3 Usage

S3 is reserved for file objects only:

- vehicle images
- blog images
- generated documents
- future uploaded documents

Application records and metadata belong in DynamoDB.

## API Routes

- `GET /api/health`
- `POST /api/chat`
- `POST /api/auth/firebase/sync`
- `GET /api/cars`
- `GET /api/cars/:id`
- `GET /api/brands`
- `GET /api/blogs`
- `GET /api/blogs/:category/:slug`
- `GET /api/reviews`
- `POST /api/reviews`
- `GET /api/favourites`
- `POST /api/favourites`
- `DELETE /api/favourites/:carId`
- `GET /api/recently-viewed`
- `POST /api/recently-viewed`
- `POST /api/test-drives`
- `POST /api/newsletter`
- `GET|POST /api/payments`
- `GET|POST /api/notifications`
- `GET|POST /api/admin`

When DynamoDB is not configured, read APIs return empty data quickly and write APIs return `503` with a clear setup message.

## Frontend Integration

The existing frontend still works with its static data and localStorage. Backend calls are added as background sync points for:

- Firebase user sync
- favourites
- recently viewed
- test drive leads
- newsletter subscriptions
- chatbot

This keeps current functionality intact while enabling production persistence once AWS and Firebase Admin secrets are configured.
